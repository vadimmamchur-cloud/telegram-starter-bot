import { InlineKeyboard } from "grammy"

const menu = new InlineKeyboard()
  .text("📊 Ціна LOOT", "price")
  .text("💰 Баланс", "balance")
  .row()
  .text("🔍 Аналіз ринку", "analysis")
  .text("❓ Допомога", "help")

export function registerCommands(bot) {
  bot.command("start", async (ctx) => {
    await ctx.reply(
      "🤖 TON TRADER\n\n" +
      "Помічник для аналізу токенів мережі TON.\n\n" +
      "Торгівля поки вимкнена. Кожну майбутню операцію ти підтверджуватимеш сам.",
      { reply_markup: menu }
    )
  })

  bot.command("help", (ctx) =>
    ctx.reply(
      "Команди TON Trader:\n\n" +
      "/start — головне меню\n" +
      "/price — ціна LOOT\n" +
      "/balance — баланс\n" +
      "/analysis — аналіз ринку\n" +
      "/ping — перевірка роботи бота"
    )
  )

  bot.command("ping", (ctx) => ctx.reply("TON Trader працює 🟢"))

  bot.command("price", (ctx) =>
    ctx.reply("📊 Дані про ціну LOOT ще не підключені. Це буде наступний етап.")
  )

  bot.command("balance", (ctx) =>
    ctx.reply("💰 Гаманець ще не підключений. Приватні ключі та seed-фразу вводити не потрібно.")
  )

  bot.command("analysis", (ctx) =>
    ctx.reply("🔍 Модуль аналізу ринку ще налаштовується.")
  )

  bot.callbackQuery("price", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply("📊 Дані про ціну LOOT ще не підключені.")
  })

  bot.callbackQuery("balance", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply("💰 Гаманець ще не підключений.")
  })

  bot.callbackQuery("analysis", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply("🔍 Модуль аналізу ринку ще налаштовується.")
  })

  bot.callbackQuery("help", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply("Використовуй /help, щоб побачити список команд.")
  })
}
