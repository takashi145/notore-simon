import { useEffect, useState } from 'preact/hooks'
import { Logo } from './Logo'

// 使用する文字
const TEXTS = ['右', '左'] as const

// 表示位置
type Position = 'left' | 'right'

// 位置の表示用マッピング
const POSITION_MAP: Record<Position, string> = {
  'left': '左',
  'right': '右',
}

// モード表示用マップ
const MODE_DISPLAY_MAP: Record<GameMode, string> = {
  'text': '表示された文字を答える',
  'position': '表示された位置を答える',
}

const GAME_TIME_LIMIT = 60 // ゲームの制限時間（秒）

type GameMode = 'text' | 'position'

export function Game() {
  const [gameStarted, setGameStarted] = useState(false)
  const [mode, setMode] = useState<GameMode | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT)
  const [displayText, setDisplayText] = useState<typeof TEXTS[number] | null>(null)
  const [displayPosition, setDisplayPosition] = useState<Position | null>(null)
  const [result, setResult] = useState<boolean | null>(null)  // 正解・不正解
  const [disabled, setDisabled] = useState(false) // 回答ボタンの無効化
  const [totalAnswers, setTotalAnswers] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null) // ゲーム開始前のカウントダウン
  const [positionOffset, setPositionOffset] = useState(0) // 位置のオフセット

  // ゲーム開始
  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode)
    setCountdown(3)
    setDisabled(true)
  }

  // 新しい問題を生成
  const generateNewChallenge = () => {
    const randomText = TEXTS[Math.floor(Math.random() * TEXTS.length)]
    const randomPosition: Position = Math.random() < 0.5 ? 'left' : 'right'
    setDisplayText(randomText)
    setDisplayPosition(randomPosition)
    setPositionOffset(Math.floor(Math.random() * 31) + 5) // 5から35の間でランダムにオフセットを設定
  }

  // 回答処理
  const handleAnswer = (answer: string) => {
    if (result !== null && displayText !== null && displayPosition !== null) return

    setDisabled(true)

    // モードに応じて解答の正解を決定
    const correctAnswer = mode === 'text'
      ? displayText
      : POSITION_MAP[displayPosition!]

    // 回答の正誤判定
    if (answer === correctAnswer) {
      setScore((prev) => prev + 1)
      setResult(true)
    } else {
      setResult(false)
    }
    setTotalAnswers((prev) => prev + 1)

    // 次の問題を表示
    setTimeout(() => {
      setResult(null)
      generateNewChallenge()
      setDisabled(false)
    }, 500)
  }

  // ゲーム開始時にタイマーをセット
  useEffect(() => {
    if (!gameStarted) return

    setScore(0)
    setTimeLeft(GAME_TIME_LIMIT)
    setTotalAnswers(0)
    setResult(null)

    // 最初の問題を生成
    generateNewChallenge()

    // 1秒ごとに時間を減らすタイマー
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted])

  // ゲーム開始前のカウントダウン
  useEffect(() => {
    if (countdown === null) return

    if (countdown === 0) {
      setCountdown(null)
      setGameStarted(true)
      generateNewChallenge()
      setDisabled(false)
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown])

  // ゲーム画面表示判定
  // ゲームが開始されているか、カウントダウン中であること
  const isGameScreenVisible = (gameStarted || countdown !== null) && mode !== null && timeLeft > 0;

  // ゲーム画面
  if (isGameScreenVisible) {
    return (
      <>
        <div class="max-w-4xl w-full bg-white dark:bg-gray-800 sm:rounded-2xl shadow-2xl px-4 py-12 sm:p-6 space-y-3 sm:space-y-4 transition-colors duration-300">
          <div class="bg-gray-50 dark:bg-gray-700 shadow p-3 sm:p-4 space-y-3 transition-colors duration-300">
            <div class="flex justify-between items-center">
              <div class="flex gap-6 sm:gap-8 items-center">
                <div class="text-center">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-300">スコア</div>
                  <div class="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">{score}</div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-300">残り時間</div>
                  <div class={`text-2xl sm:text-3xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-600 dark:text-gray-300'} transition-colors duration-300`}>
                    {timeLeft}秒
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-300">モード</div>
                <div class="font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">
                  {MODE_DISPLAY_MAP[mode]}
                </div>
              </div>
            </div>

            <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden transition-colors duration-300">
              <div
                class={`h-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 10 ? 'bg-red-500' : 'bg-blue-400 dark:bg-blue-500'
                }`}
                style={{ width: `${(timeLeft / GAME_TIME_LIMIT) * 100}%` }}
              />
            </div>
          </div>

          <div class="flex items-center justify-center mb-12 rounded-2xl relative min-h-[200px]">
            {result !== null && (
              <div class="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                <div class={`text-center py-2 px-6 rounded-lg font-bold text-lg sm:text-xl transition-colors duration-300 ${
                  result
                    ? 'border border-green-500 text-green-500 bg-green-500/20 dark:bg-green-500/30'
                    : 'border border-red-500 text-red-500 bg-red-500/20 dark:bg-red-500/30'
                }`}>
                  {result ? '⭕ 正解!' : '❌ 不正解'}
                </div>
              </div>
            )}

            <div class="mt-8 w-full">
              {countdown !== null ? (
                <div class="text-gray-600 dark:text-gray-300 text-6xl sm:text-8xl font-black text-center transition-colors duration-300">
                  {countdown}
                </div>
              ) : (
                <div class="relative w-full h-32">
                  <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 dark:bg-gray-600 -translate-x-1/2 transition-colors duration-300"></div>
                  <div
                    class={`absolute text-8xl md:text-9xl font-black text-gray-800 dark:text-gray-200 transition-colors duration-300`}
                    style={
                      displayPosition === 'left'
                        ? { left: `${positionOffset}%` }
                        : { right: `${positionOffset}%` }
                    }
                  >
                    {displayText}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6 max-w-sm mx-auto">
            <button
              class="aspect-square text-xl sm:text-2xl font-bold rounded-xl border-4 border-blue-500 text-blue-500 shadow-lg flex items-center justify-center transition-all disabled:opacity-40 enabled:hover:scale-105 disabled:enabled:active:scale-95 enabled:cursor-pointer"
              disabled={disabled || result !== null}
              onClick={() => handleAnswer('左')}
            >
              左
            </button>
            <button
              class="aspect-square text-xl sm:text-2xl font-bold rounded-xl border-4 border-purple-500 text-purple-500 shadow-lg flex items-center justify-center transition-all disabled:opacity-40 enabled:hover:scale-105 disabled:enabled:active:scale-95 enabled:cursor-pointer"
              disabled={disabled || result !== null}
              onClick={() => handleAnswer('右')}
            >
              右
            </button>
          </div>
        </div>

        <div class="absolute top-4 right-4">
          <button
            onClick={() => {
              setGameStarted(false)
              setMode(null)
              setScore(0)
              setTimeLeft(GAME_TIME_LIMIT)
              setTotalAnswers(0)
            }}
            class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-all border border-gray-300 dark:border-gray-600 cursor-pointer"
          >
            終了
          </button>
        </div>
      </>
    )
  }

  // ゲーム結果画面
  if (timeLeft === 0 && mode !== null) {
    const accuracy = totalAnswers > 0 ? Math.round((score / totalAnswers) * 100) : 0;
    const avgTimePerAnswer = totalAnswers > 0 ? (GAME_TIME_LIMIT / totalAnswers).toFixed(1) : '0';
    return (
		<div class="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 space-y-8 text-center transition-colors duration-300">
			<h1 class="text-5xl font-bold text-gray-800 dark:text-gray-200 transition-colors duration-300">終了！</h1>

			<div class="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-300">
				モード: <span class="font-bold">{MODE_DISPLAY_MAP[mode]}</span>
			</div>

			<div class="bg-blue-400 dark:bg-blue-600/30 rounded-xl p-10 transition-colors duration-300">
				<div class="text-white text-2xl mb-3">正解数</div>
				<div class="text-8xl font-bold text-white">{score}</div>
				<div class="text-white text-xl mt-3">/ {totalAnswers}問</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700 transition-colors duration-300">
					<div class="text-green-600 dark:text-green-400 text-sm font-semibold mb-2 transition-colors duration-300">正解率</div>
					<div class="text-4xl font-bold text-green-700 dark:text-green-300 transition-colors duration-300">{accuracy}%</div>
				</div>
				<div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 transition-colors duration-300">
					<div class="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-2 transition-colors duration-300">平均回答時間</div>
					<div class="text-4xl font-bold text-blue-700 dark:text-blue-300 transition-colors duration-300">{avgTimePerAnswer}秒</div>
				</div>
				<div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700 transition-colors duration-300">
					<div class="text-red-600 dark:text-red-400 text-sm font-semibold mb-2 transition-colors duration-300">不正解</div>
					<div class="text-4xl font-bold text-red-700 dark:text-red-300 transition-colors duration-300">{totalAnswers - score}問</div>
				</div>
			</div>

			<button
				onClick={() => {
					setTimeLeft(GAME_TIME_LIMIT)
					setScore(0)
					setTotalAnswers(0)
					setMode(null)
					setGameStarted(false)
				}}
				class="mt-6 px-8 py-4 bg-blue-500 dark:bg-blue-600 rounded-xl hover:bg-blue-600 dark:hover:bg-blue-700 transform hover:scale-105 transition-all shadow-lg text-white font-bold cursor-pointer"
			>
				ホームに戻る
			</button>
		</div>
    )
  }

  // ホーム画面
  return (
    <>
      <div class="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transition-colors duration-300">
        <div class="flex justify-center mb-8">
          <Logo />
        </div>
        <h1 class="text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-12 transition-colors duration-300">
          サイモン効果 脳トレ
        </h1>
        <div class="grid grid-cols-1 md:grid-cols-1 gap-4 justify-center">
          <button
            onClick={() => startGame('text')}
            class="px-8 py-4 bg-blue-500 dark:bg-blue-700/60 rounded-xl hover:bg-blue-600 dark:hover:bg-blue-600/60 transform hover:scale-105 transition-all shadow-lg cursor-pointer"
          >
            <h2 class="text-xl font-bold text-white mb-2">文字を答える</h2>
            <p class="text-sm text-gray-300 dark:text-gray-400">表示された文字を答えてください</p>
          </button>
          <button
            onClick={() => startGame('position')}
            class="px-8 py-4 bg-purple-500 dark:bg-purple-700/60 rounded-xl hover:bg-purple-600 dark:hover:bg-purple-600/60 transform hover:scale-105 transition-all shadow-lg cursor-pointer"
          >
            <h2 class="text-xl font-bold text-white mb-2">位置を答える</h2>
            <p class="text-sm text-gray-300 dark:text-gray-400">文字が表示された位置を答えてください</p>
          </button>
        </div>
      </div>
    </>
  )
}
