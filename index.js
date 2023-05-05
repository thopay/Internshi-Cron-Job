const axios = require("axios");

const GITHUB_API_URL = "https://api.github.com";
const REPO_URL = "https://github.com/pittcsc/Summer2023-Internships/blob/dev/README-2024.md";
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function getLatestCommitSha() {
  const response = await axios.get(`${GITHUB_API_URL}/repos/pittcsc/Summer2023-Internships/commits?path=README-2024.md&sha=dev`);
  return response.data[0].sha;
}

async function sendDiscordNotification() {
  const embed = {
    title: "New changes detected!",
    description: `There are new changes to the PittCS Summer 2024 Internship repo. Check them out!`,
    color: 16711680,
  };

  await axios.post(DISCORD_WEBHOOK_URL, { embeds: [embed] });
}

module.exports = async (req, res) => {
  const lastCommitSha = await getLatestCommitSha();
  const storedCommitSha = req.cookies["lastCommitSha"];

  if (!storedCommitSha || storedCommitSha !== lastCommitSha) {
    await sendDiscordNotification();
    res.setHeader("Set-Cookie", `lastCommitSha=${lastCommitSha}; Path=/; Max-Age=86400; HttpOnly`);
  }

  res.status(200).send("Checked for changes and sent notification if needed.");
};