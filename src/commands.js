import { InlineKeyboard } from "grammy"

const keyboard = new InlineKeyboard()
  .text("📊 Ціна токена", "price")
  .text("🔍 Аналіз", "analysis")
  .row()
  .text("❓ Допомога", "help")

async function getTokenData(address) {
  const url = `https://api.dexscreener.com/token-pairs/v1/ton/${encodeURIComponent(address)}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("Помилка отримання даних")
  }

  const pairs = await response.json()

  if (!Array.isArray(pairs) || pairs.length === 0) {
    return null
  }

  pairs.sort((a, b) =>
    Number(b.liquidity?.usd || 0) -
    Number(a.liquidity?.usd || 0)
  )

  return pairs[0]
}

function formatData(pair) {
  const price = Number(pair.priceUsd || 0)
  const liquidity = Number(pair.liquidity?.usd || 0)
  const volume = Number(pair.volume?.h24 || 0)
  const change = Number(pair.priceChange?.h24 || 0)

  return [
    `🪙 ${pair.baseToken?.name || "Token"} (${pair.baseToken?.symbol || "?"})`,
    "",
    `💵 Ціна: $${price.toPrecision(7)}`,
    `💧 Ліквідність: $${liquidity.toFixed(2)}`,
    `📈 Обсяг за 24 год: $${volume.toFixed(2)}`,
    `📊 Зміна за 24 год: ${change.toFixed(2)}%`,
    `🏦 Біржа: ${pair.dexId || "невідомо"}`,
    "",
    "Дані інформаційні. Не фінансова рекомендація."
  ].join("\n")
}

export function registerCommands(bot) {
  bot.command("start", async (ctx) => {
    await ctx.reply(
      "🤖 TON TRADER\n\n" +
      "Помічник для аналізу токенів мережі TON.\n\n" +
      "📊 Ціни та ринкові дані\n" +
      "🔍 Аналіз ліквідності\n" +
      "📈 Обсяг і зміна ціни\n\n" +
      "Торгівля поки вимкнена. Усі майбутні угоди — тільки після твого підтвердження.",
      { reply_markup: keyboard }
    )
  })

  bot.command("help", async (ctx) => {
    await ctx.reply(
      "КОМАНДИ TON TRADER\n\n" +
      "/start — головне меню\n" +
      "/price АДРЕСА — ціна токена\n" +
      "/analysis АДРЕСА — аналіз токена\n" +
      "/ping — перевірка роботи"
    )
  })

  bot.command("ping", async (ctx) => {
    await ctx.reply("🟢 TON Trader працює!")
  })

  bot.command("price", async (ctx) => {
    const address = ctx.match.trim()

    if (!address) {
      return ctx.reply("Вкажи адресу Jetton:\n/price АДРЕСА_ТОКЕНА")
    }

    try {
      const pair = await getTokenData(address)

      if (!pair) {
        return ctx.reply("Токен або торгову пару не знайдено.")
      }

      await ctx.reply(formatData(pair))
    } catch (error) {
      console.error(error)
      await ctx.reply("Не вдалося отримати дані. Спробуй пізніше.")
    }
  })

  bot.command("analysis", async (ctx) => {
    const address = ctx.match.trim()

    if (!address) {
      return ctx.reply("Вкажи адресу Jetton:\n/analysis АДРЕСА_ТОКЕНА")
    }

    try {
      const pair = await getTokenData(address)

      if (!pair) {
        return ctx.reply("Торгову пару не знайдено.")
      }

      const liquidity = Number(pair.liquidity?.usd || 0)
      const volume = Number(pair.volume?.h24 || 0)

      let assessment = "⚠️ Потрібна додаткова перевірка."

      if (liquidity >= 10000 && volume >= 5000) {
        assessment = "Є помітна ліквідність та торговий обсяг."
      } else if (liquidity < 1000) {
        assessment = "⚠️ Низька ліквідність. Високий ризик прослизання."
      }

      await ctx.reply(
        formatData(pair) + "\n\n🔎 ОЦІНКА\n" + assessment
      )
    } catch (error) {
      console.error(error)
      await ctx.reply("Помилка аналізу. Спробуй пізніше.")
    }
  })

  bot.callbackQuery("price", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply("Використай /price і адресу токена.")
  })

  bot.callbackQuery("analysis", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply("Використай /analysis і адресу токена.")
  })

  bot.callbackQuery("help", async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.reply("Надішли /help для списку команд.")
  })
}
