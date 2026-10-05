import type { ButtonHTMLAttributes, ReactNode } from 'react';

import './_gradientButton.scss';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
}

export const GradientButton = ({ children, className = '', type = 'button', ...props }: GradientButtonProps) => {
	return (
		<button type={type} className={`gradient-button ${className}`.trim()} {...props}>
			<span className="gradient-button__content">{children}</span>
		</button>
	);
};
