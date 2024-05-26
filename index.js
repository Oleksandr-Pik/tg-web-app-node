require("dotenv").config();
const express = require("express");
const cors = require("cors");
const TelegramBot = require("node-telegram-bot-api");

const PORT = process.env.PORT;
const token = process.env.TG_API_TOKEN;
const webAppUrl = "https://tg-web-app2024.netlify.app";

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(chatId, "Нижче з'явиться кнопка, заповнити форму", {
      reply_markup: {
        keyboard: [
          [{ text: "Заповнити форму", web_app: { url: webAppUrl + "/form" } }],
        ],
      },
    });

    await bot.sendMessage(
      chatId,
      "Заходьте в наш інтернет магазин по кнопці нижче",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Зробити замовлення", web_app: { url: webAppUrl } }],
          ],
        },
      }
    );
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      console.log(data);
      await bot.sendMessage(chatId, "Дякуємо за зворотній зв'язок!");
      await bot.sendMessage(chatId, "Ваше місто: " + data?.city);
      await bot.sendMessage(chatId, "Ваше вулиця: " + data?.street);

      setTimeout(async () => {
        await bot.sendMessage(
          chatId,
          "Всю інформацію ви отримаєте в цьому чаті"
        );
      }, 3000);
    } catch (error) {
      console.log(error.message);
    }
  }
});

app.post("/web", async (req, res) => {
  const { queryId, products, totalPrice } = req.body;
  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Вдала покупка",
      input_message_content: {
        message_text: `Вітаємо з покупкою, ви придбали товар на суму ${totalPrice}, ${products
          .map((item) => item.title)
          .join(", ")}`,
      },
    });
    return res.status(200).json({});
  } catch (error) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Не вдалося придбати товар",
      input_message_content: { message_text: "Не вдалося придбати товар" },
    });
    return res.status(500).json({});
  }
});

app.listen(PORT, () => console.log("server started on PORT: " + PORT));
