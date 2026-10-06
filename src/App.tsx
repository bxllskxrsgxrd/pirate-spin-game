import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import backgroundImage from './assets/images/background.png';
import chestClosedImage from './assets/images/chest-closed.png';
import chestOpenImage from './assets/images/chest-open.png';
import compassImage from './assets/images/compass.png';
import frameImage from './assets/images/frame.png';
import progressBarImage from './assets/images/progress-bar.png';
import scarabImage from './assets/images/scarab.png';
import spinSound from './assets/sounds/spin.mp3';
import winSound from './assets/sounds/win.mp3';
import burger from './assets/svg/burger.svg';
import spinArrow from './assets/svg/spin-arrow.svg';
import { GradientButton } from './components/GradientButton/GradientButton';

type SymbolName =
	| 'bird-blue'
	| 'bird-green'
	| 'bird-purple'
	| 'bird-red'
	| 'gem-blue'
	| 'gem-green'
	| 'gem-purple'
	| 'gem-red'
	| 'gold-hand'
	| 'super-bonus';

type SlotSymbol = {
	id: string;
	name: SymbolName;
};

type GamePhase = 'idle' | 'spinning' | 'bonus-complete' | 'super-bonus-complete' | 'congratulations';
type RoundIndex = 0 | 1;

const COLUMN_COUNT = 6;
const ROW_COUNT = 5;
const REEL_FILLER_COUNT = 15;
const REEL_START_DELAY = 220;
const REEL_BASE_DURATION = 1800;
const REEL_DURATION_STEP = 350;
const ROUND_DURATION = REEL_BASE_DURATION + (COLUMN_COUNT - 1) * (REEL_START_DELAY + REEL_DURATION_STEP);
const AUTO_ROUND_DELAY = 650;
const CONGRATULATIONS_DELAY = 700;
const OFFER_URL: string | null = null;

const initialSymbolNames: SymbolName[] = [
	'gem-red', 'bird-blue', 'gem-green', 'gem-purple', 'bird-red', 'gem-blue',
	'bird-green', 'gem-purple', 'gold-hand', 'gem-red', 'bird-purple', 'gem-green',
	'gem-blue', 'super-bonus', 'bird-red', 'gem-green', 'gem-purple', 'bird-blue',
	'gem-purple', 'bird-green', 'gem-red', 'gem-blue', 'bird-purple', 'gem-green',
	'bird-red', 'gem-blue', 'gem-green', 'gold-hand', 'bird-blue', 'gem-red',
];

const bonusRoundNames: SymbolName[] = [
	'gem-blue', 'bird-red', 'gem-purple', 'bird-green', 'gem-red', 'bird-blue',
	'bird-purple', 'gem-green', 'bird-blue', 'gem-red', 'bird-green', 'gem-purple',
	'gold-hand', 'gold-hand', 'gold-hand', 'gold-hand', 'gold-hand', 'gold-hand',
	'gem-green', 'bird-purple', 'gem-red', 'bird-blue', 'gem-blue', 'bird-red',
	'bird-green', 'gem-purple', 'bird-red', 'gem-blue', 'bird-purple', 'gem-green',
];

const superBonusRoundNames: SymbolName[] = [
	'bird-green', 'gem-blue', 'bird-red', 'gem-purple', 'bird-blue', 'gem-green',
	'gem-red', 'bird-purple', 'gem-green', 'bird-blue', 'gem-purple', 'bird-red',
	'super-bonus', 'super-bonus', 'super-bonus', 'super-bonus', 'super-bonus', 'super-bonus',
	'bird-blue', 'gem-red', 'bird-green', 'gem-blue', 'bird-purple', 'gem-green',
	'gem-purple', 'bird-red', 'gem-blue', 'bird-green', 'gem-red', 'bird-blue',
];

const fillerSymbols: SymbolName[] = [
	'gem-blue',
	'bird-green',
	'gem-red',
	'bird-purple',
	'gem-green',
	'bird-blue',
	'gem-purple',
	'bird-red',
];

function createMatrix(names: SymbolName[], prefix: string): SlotSymbol[] {
	return names.map((name, index) => ({ id: `${prefix}-${index}`, name }));
}

const initialSymbols = createMatrix(initialSymbolNames, 'initial');
const roundResults = [createMatrix(bonusRoundNames, 'bonus'), createMatrix(superBonusRoundNames, 'super')] as const;

const symbolAssets = import.meta.glob<string>('./assets/symbols/*.png', {
	eager: true,
	query: '?url',
	import: 'default',
});

const symbolLabels: Record<SymbolName, string> = {
	'bird-blue': 'Blue bird',
	'bird-green': 'Green bird',
	'bird-purple': 'Purple bird',
	'bird-red': 'Red bird',
	'gem-blue': 'Blue gem',
	'gem-green': 'Green gem',
	'gem-purple': 'Purple gem',
	'gem-red': 'Red gem',
	'gold-hand': 'Golden hand',
	'super-bonus': 'Super bonus',
};

function getSymbolImage(name: SymbolName) {
	return symbolAssets[`./assets/symbols/${name}.png`];
}

function getColumn(matrix: readonly SlotSymbol[], columnIndex: number) {
	return Array.from({ length: ROW_COUNT }, (_, rowIndex) => matrix[rowIndex * COLUMN_COUNT + columnIndex]);
}

function createReelStrips(current: readonly SlotSymbol[], target: readonly SlotSymbol[], roundIndex: RoundIndex) {
	return Array.from({ length: COLUMN_COUNT }, (_, columnIndex) => {
		const currentColumn = getColumn(current, columnIndex);
		const targetColumn = getColumn(target, columnIndex);
		const filler = Array.from({ length: REEL_FILLER_COUNT }, (_, fillerIndex) => ({
			id: `round-${roundIndex}-column-${columnIndex}-filler-${fillerIndex}`,
			name: fillerSymbols[(fillerIndex + columnIndex * 2 + roundIndex) % fillerSymbols.length],
		}));

		return [...targetColumn, ...filler, ...currentColumn];
	});
}

const preparedRoundReels = [
	createReelStrips(initialSymbols, roundResults[0], 0),
	createReelStrips(roundResults[0], roundResults[1], 1),
] as const;

function Slot({ symbol }: { symbol: SlotSymbol }) {
	const image = getSymbolImage(symbol.name);

	return (
		<div className="slot-cell" data-symbol={symbol.name}>
			{image ? (
				<img className="slot-symbol" src={image} alt={symbolLabels[symbol.name]} />
			) : (
				<span className={`symbol-fallback symbol-fallback--${symbol.name}`} aria-hidden="true">
					{symbol.name === 'super-bonus' && <span>BONUS</span>}
					{symbol.name === 'gold-hand' && <span>✋</span>}
				</span>
			)}
		</div>
	);
}

function App() {
	const [symbols, setSymbols] = useState<SlotSymbol[]>(initialSymbols);
	const [reelStrips, setReelStrips] = useState<SlotSymbol[][] | null>(null);
	const [phase, setPhase] = useState<GamePhase>('idle');
	const [autoEnabled, setAutoEnabled] = useState(false);
	const [completedRounds, setCompletedRounds] = useState(0);

	const phaseRef = useRef<GamePhase>('idle');
	const nextRoundRef = useRef<RoundIndex | 2>(0);
	const autoEnabledRef = useRef(false);
	const winPlayedRef = useRef(false);
	const timersRef = useRef<number[]>([]);
	const spinAudioRefs = useRef<HTMLAudioElement[]>([]);
	const winAudioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		spinAudioRefs.current = Array.from({ length: COLUMN_COUNT }, () => new Audio(spinSound));
		winAudioRef.current = new Audio(winSound);

		return () => {
			timersRef.current.forEach((timer) => window.clearTimeout(timer));
			spinAudioRefs.current.forEach((audio) => audio.pause());
			winAudioRef.current?.pause();
		};
	}, []);

	function updatePhase(nextPhase: GamePhase) {
		phaseRef.current = nextPhase;
		setPhase(nextPhase);
	}

	function schedule(callback: () => void, delay: number) {
		const timer = window.setTimeout(() => {
			timersRef.current = timersRef.current.filter((activeTimer) => activeTimer !== timer);
			callback();
		}, delay);

		timersRef.current.push(timer);
	}

	function playAudio(audio: HTMLAudioElement | null) {
		if (!audio) return;

		audio.pause();
		audio.currentTime = 0;
		void audio.play().catch(() => undefined);
	}

	function startRound(roundIndex: RoundIndex) {
		if (phaseRef.current === 'spinning' || phaseRef.current === 'congratulations' || nextRoundRef.current > roundIndex) return;

		const target = roundResults[roundIndex];
		setReelStrips(preparedRoundReels[roundIndex]);
		updatePhase('spinning');
		spinAudioRefs.current.forEach((audio, columnIndex) => {
			if (columnIndex === 0) {
				playAudio(audio);
				return;
			}

			schedule(() => playAudio(audio), columnIndex * REEL_START_DELAY);
		});

		schedule(() => {
			const roundsFinished = roundIndex + 1;
			const completedMatrix = [...target];

			nextRoundRef.current = roundsFinished as RoundIndex | 2;
			setSymbols(completedMatrix);
			setReelStrips(null);
			setCompletedRounds(roundsFinished);

			if (roundIndex === 0) {
				updatePhase('bonus-complete');

				if (autoEnabledRef.current) {
					schedule(() => {
						if (autoEnabledRef.current && phaseRef.current === 'bonus-complete') startRound(1);
					}, AUTO_ROUND_DELAY);
				}
				return;
			}

			updatePhase('super-bonus-complete');
			if (!winPlayedRef.current) {
				winPlayedRef.current = true;
				playAudio(winAudioRef.current);
			}

			schedule(() => {
				if (phaseRef.current === 'super-bonus-complete') updatePhase('congratulations');
			}, CONGRATULATIONS_DELAY);
		}, ROUND_DURATION);
	}

	function handleSpin() {
		if (nextRoundRef.current === 0) startRound(0);
		if (nextRoundRef.current === 1) startRound(1);
	}

	function handleAutoToggle() {
		setAutoEnabled((currentValue) => {
			const nextValue = !currentValue;
			autoEnabledRef.current = nextValue;
			return nextValue;
		});
	}

	function handleOfferContinue() {
		if (OFFER_URL) window.location.assign(OFFER_URL);
	}

	const isSpinning = phase === 'spinning';
	const isCongratulations = phase === 'congratulations';
	const controlsLocked = phase === 'super-bonus-complete';
	const progressValue = completedRounds === 0 ? 0 : completedRounds === 1 ? 25 : 100;
	const isChestOpen = completedRounds === 2;

	return (
		<main className="game-screen" data-game-state={phase} style={{ '--game-background': `url(${backgroundImage})` } as CSSProperties}>
			<div className="game-stage">
				{!isCongratulations && (
					<header className="progress-panel" aria-label="Treasure progress">
						<img className="progress-panel__compass" src={compassImage} alt="" />
						<div className="progress-panel__meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressValue}>
							<span className="progress-panel__bar-shell">
								<img className="progress-panel__bar" src={progressBarImage} alt="" />
								<span className="progress-panel__fill-track" aria-hidden="true">
									<span className="progress-panel__fill" style={{ width: `${progressValue}%` }} />
								</span>
							</span>
							<img className={`progress-panel__chest${isChestOpen ? ' is-open' : ''}`} src={isChestOpen ? chestOpenImage : chestClosedImage} alt={isChestOpen ? 'Open treasure chest' : 'Closed treasure chest'} />
						</div>
					</header>
				)}

				<div className={`game-content${isCongratulations ? ' game-content--congratulations' : ''}`}>
					{isCongratulations ? (
						<section className="congratulations" aria-labelledby="congratulations-title">
							<h1 id="congratulations-title">Congratulations!</h1>
							<p>You have won bonuses</p>
							<button className="congratulations__button" type="button" onClick={handleOfferContinue}>Claim Bonus</button>
						</section>
					) : (
						<>
							<section className="board-shell" aria-label="Game board, 6 columns by 5 rows">
								<div className={`slot-grid${isSpinning ? ' is-spinning' : ''}`}>
									{Array.from({ length: COLUMN_COUNT }, (_, columnIndex) => {
										const column = reelStrips?.[columnIndex] ?? getColumn(symbols, columnIndex);
										const reelStyle = {
											'--reel-delay': `${columnIndex * REEL_START_DELAY}ms`,
											'--reel-duration': `${REEL_BASE_DURATION + columnIndex * REEL_DURATION_STEP}ms`,
										} as CSSProperties;

										return (
											<div className="slot-reel" key={columnIndex}>
												<div className={reelStrips ? 'slot-reel__strip' : 'slot-reel__symbols'} style={reelStyle}>
													{column.map((symbol) => <Slot key={symbol.id} symbol={symbol} />)}
												</div>
											</div>
										);
									})}
								</div>
								<img className="board-frame" src={frameImage} alt="" />
							</section>

							<div className="scarab-track" aria-label="Bonus scarabs">
								{[0, 1, 2].map((position) => (
									<div className={`scarab-track__slot${position < completedRounds ? ' is-complete' : ''}`} key={position}>
										<img src={scarabImage} alt={`Scarab ${position + 1}`} />
									</div>
								))}
							</div>
						</>
					)}
				</div>

				{!isCongratulations && (
					<nav className="game-controls" aria-label="Game controls">
						<GradientButton className="control-button control-button--menu" aria-label="Open menu" disabled={isSpinning || controlsLocked}>
							<span className="menu-icon" aria-hidden="true"><img src={burger} alt="" /></span>
						</GradientButton>

						<GradientButton className={`control-button control-button--spin${isSpinning ? ' is-spinning' : ''}`} aria-label="Spin" disabled={isSpinning || controlsLocked} onClick={handleSpin}>
							<span className="spin-button__arrow" aria-hidden="true"><img src={spinArrow} alt="" /></span>
						</GradientButton>

						<GradientButton className={`control-button control-button--auto${autoEnabled ? ' is-active' : ''}`} aria-label="Auto spin" aria-pressed={autoEnabled} disabled={controlsLocked} onClick={handleAutoToggle}>
							<span>Auto</span>
						</GradientButton>
					</nav>
				)}
			</div>
		</main>
	);
}

export default App;
