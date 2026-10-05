import backgroundImage from './assets/images/background.png';
import chestClosedImage from './assets/images/chest-closed.png';
import chestOpenImage from './assets/images/chest-open.png';
import compassImage from './assets/images/compass.png';
import frameImage from './assets/images/frame.png';
import progressBarImage from './assets/images/progress-bar.png';
import scarabImage from './assets/images/scarab.png';

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
	id: number;
	name: SymbolName;
};

const symbolNames: SymbolName[] = [
	'gem-red',
	'bird-blue',
	'gem-green',
	'gem-purple',
	'bird-red',
	'gem-blue',
	'bird-green',
	'gem-purple',
	'gold-hand',
	'gem-red',
	'bird-purple',
	'gem-green',
	'gem-blue',
	'super-bonus',
	'bird-red',
	'gem-green',
	'gem-purple',
	'bird-blue',
	'gem-purple',
	'bird-green',
	'gem-red',
	'gem-blue',
	'bird-purple',
	'gem-green',
	'bird-red',
	'gem-blue',
	'gem-green',
	'gold-hand',
	'bird-blue',
	'gem-red',
];

const initialSymbols: SlotSymbol[] = symbolNames.map((name, id) => ({ id, name }));

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

const isChestOpen = false;

function getSymbolImage(name: SymbolName) {
	return symbolAssets[`./assets/symbols/${name}.png`];
}

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
	return (
		<main className="game-screen" style={{ '--game-background': `url(${backgroundImage})` } as React.CSSProperties}>
			<div className="game-stage">
				<header className="progress-panel" aria-label="Treasure progress">
					<img className="progress-panel__compass" src={compassImage} alt="" />
					<div className="progress-panel__meter">
						<img className="progress-panel__bar" src={progressBarImage} alt="Progress" />
						<img
							className="progress-panel__chest"
							src={isChestOpen ? chestOpenImage : chestClosedImage}
							alt={isChestOpen ? 'Open treasure chest' : 'Closed treasure chest'}
						/>
					</div>
				</header>

				<section className="board-shell" aria-label="Game board, 6 columns by 5 rows">
					<div className="slot-grid">
						{initialSymbols.map((symbol) => (
							<Slot key={symbol.id} symbol={symbol} />
						))}
					</div>
					<img className="board-frame" src={frameImage} alt="" />
				</section>

				<div className="scarab-track" aria-label="Bonus scarabs">
					{[0, 1, 2].map((position) => (
						<div className="scarab-track__slot" key={position}>
							<img src={scarabImage} alt={`Scarab ${position + 1}`} />
						</div>
					))}
				</div>

				<nav className="game-controls" aria-label="Game controls">
					<GradientButton className="control-button control-button--menu" aria-label="Open menu">
						<span className="menu-icon" aria-hidden="true">
							<img src={burger} alt="Burger Menu" />
						</span>
					</GradientButton>

					<GradientButton className="control-button control-button--spin" aria-label="Spin">
						<span className="spin-button__arrow" aria-hidden="true">
							<img src={spinArrow} alt="Spin Arrow" />
						</span>
					</GradientButton>

					<GradientButton className="control-button control-button--auto" aria-label="Auto spin">
						<span>Auto</span>
					</GradientButton>
				</nav>
			</div>
		</main>
	);
}

export default App;
