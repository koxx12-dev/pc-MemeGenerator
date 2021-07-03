const { Plugin } = require("powercord/entities");
const https = require("https");
const { getModule, channels } = require("powercord/webpack");
const { createBotMessage } = getModule(["createBotMessage"], false);
const { receiveMessage } = getModule(["receiveMessage"], false);
const { sendMessage } = getModule(["sendMessage"], false);

module.exports = class MemeGenerator extends Plugin {
  HowMany(strg, wrd) {
    return strg.split(wrd).length - 1;
  }

  async sendUserMessage(content) {
    sendMessage(channels.getChannelId(), { content: `${content}` });
  }

  async sendBotMessage(content) {
    const received = createBotMessage(channels.getChannelId(), content);
    console.log(received)
    received.author.username = "Meme Generator";
    received.author.avatar = "powercord";
    return receiveMessage(received.channel_id, received);
  }

  Code(args) {
    const { sendUserMessage, sendBotMessage } = this;
    if (args.length != 0) {
      if (args[0].includes("http")) {
        var url = args[0];
        args.splice(0, 1);
        var text = args.join(" ");
        if (text.includes("|") && this.HowMany(text, "|") == 1) {
          var textformatted = text.split("|");

          var json = null;

          const data = JSON.stringify({
            background: url,
            text_lines: [textformatted[0], textformatted[1]],
            extension: ".png",
            redirect: false,
          });

          const options = {
            hostname: "api.memegen.link",
            path: "/images/custom",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": data.length,
            },
          };

          const req = https.request(options, (res) => {
            console.log(`statusCode: ${res.statusCode}`);

            res.on("data", (d) => {
              json = JSON.parse(d.toString());
            });

            res.on("end", (end) => {
              sendUserMessage(json.url);
            });

            res.on("error", (error) => {
              console.log(error);
            });
          });

          req.write(data);
          req.end();
        } else {
          sendBotMessage(
            'Incorrect text, you need to do this way "<IMG URL> <TOP TEXT|BOTTOM TEXT>"'
          );
        }
      } else {
        sendBotMessage(
          'Incorrect text, you need to do this way "<IMG URL> <TOP TEXT|BOTTOM TEXT>"'
        );
      }
    } else {
      sendBotMessage(
        'Incorrect text, you need to do this way "<IMG URL> <TOP TEXT|BOTTOM TEXT>"'
      );
    }
  }

  async startPlugin() {
    console.log("test");
    powercord.api.commands.registerCommand({
      command: "memegen",
      description: "Generate a meme",
      usage: "{c} <IMG URL> <TOP TEXT|BOTTOM TEXT>",
      executor: async (args) => {
        this.Code(args);
      },
    });
  }
  PluginWillUnload() {
    powercord.api.commands.unregisterCommand("memegen");
  }
};
