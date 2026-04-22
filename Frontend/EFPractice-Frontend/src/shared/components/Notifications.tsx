import { useEffect, useMemo, useRef } from 'react';

export type NotificationVariant = 'success' | 'error' | 'warning' | 'info';

export interface NotificationItem {
	id: string;
	message: string;
	title?: string;
	variant?: NotificationVariant;
	durationMs?: number;
	dismissible?: boolean;
	actionLabel?: string;
	onAction?: () => void;
}

export interface NotificationsProps {
	notifications: NotificationItem[];
	onDismiss: (id: string) => void;
	maxVisible?: number;
	defaultDurationMs?: number;
	position?:
		| 'top-right'
		| 'top-left'
		| 'bottom-right'
		| 'bottom-left'
		| 'top-center'
		| 'bottom-center';
	className?: string;
}

const POSITION_STYLE_MAP: Record<NonNullable<NotificationsProps['position']>, React.CSSProperties> = {
	'top-right': { top: 16, right: 16 },
	'top-left': { top: 16, left: 16 },
	'bottom-right': { bottom: 16, right: 16 },
	'bottom-left': { bottom: 16, left: 16 },
	'top-center': { top: 16, left: '50%', transform: 'translateX(-50%)' },
	'bottom-center': { bottom: 16, left: '50%', transform: 'translateX(-50%)' },
};

const VARIANT_STYLE_MAP: Record<NotificationVariant, React.CSSProperties> = {
	success: {
		border: '1px solid rgba(34, 197, 94, 0.5)',
		background: 'linear-gradient(180deg, rgba(22, 163, 74, 0.33), rgba(21, 128, 61, 0.23))',
	},
	error: {
		border: '1px solid rgba(251, 113, 133, 0.58)',
		background: 'linear-gradient(180deg, rgba(244, 63, 94, 0.37), rgba(190, 24, 93, 0.25))',
	},
	warning: {
		border: '1px solid rgba(251, 191, 36, 0.58)',
		background: 'linear-gradient(180deg, rgba(234, 179, 8, 0.32), rgba(180, 83, 9, 0.21))',
	},
	info: {
		border: '1px solid rgba(96, 165, 250, 0.58)',
		background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.33), rgba(14, 116, 144, 0.24))',
	},
};

function Notifications({
	notifications,
	onDismiss,
	maxVisible = 4,
	defaultDurationMs = 4000,
	position = 'top-right',
	className,
}: NotificationsProps) {
	const timerMapRef = useRef<Map<string, number>>(new Map());

	const visibleNotifications = useMemo(
		() => notifications.slice(0, maxVisible),
		[notifications, maxVisible]
	);

	useEffect(() => {
		const timerMap = timerMapRef.current;

		visibleNotifications.forEach((notification) => {
			const duration = notification.durationMs ?? defaultDurationMs;
			if (duration <= 0 || timerMap.has(notification.id)) {
				return;
			}

			const timerId = window.setTimeout(() => {
				onDismiss(notification.id);
				timerMap.delete(notification.id);
			}, duration);

			timerMap.set(notification.id, timerId);
		});

		const visibleIds = new Set(visibleNotifications.map((notification) => notification.id));

		Array.from(timerMap.keys()).forEach((id) => {
			if (!visibleIds.has(id)) {
				const timerId = timerMap.get(id);
				if (timerId !== undefined) {
					window.clearTimeout(timerId);
				}
				timerMap.delete(id);
			}
		});

		return () => {
			timerMap.forEach((timerId) => window.clearTimeout(timerId));
			timerMap.clear();
		};
	}, [visibleNotifications, defaultDurationMs, onDismiss]);

	if (visibleNotifications.length === 0) {
		return null;
	}

	return (
		<aside
			aria-live="polite"
			className={className}
			style={{
				position: 'fixed',
				zIndex: 9999,
				display: 'flex',
				flexDirection: 'column',
				gap: 10,
				width: 'min(92vw, 360px)',
				...POSITION_STYLE_MAP[position],
			}}
		>
			{visibleNotifications.map((notification) => {
				const variant = notification.variant ?? 'info';
				const dismissible = notification.dismissible ?? true;

				return (
					<section
						key={notification.id}
						role="status"
						style={{
							color: '#f8fafc',
							boxShadow: '0 14px 26px rgba(15, 23, 42, 0.35)',
							borderRadius: 14,
							padding: '10px 12px',
							backdropFilter: 'blur(4px)',
							...VARIANT_STYLE_MAP[variant],
						}}
					>
						{(notification.title || dismissible) && (
							<header
								style={{
									display: 'flex',
									alignItems: 'start',
									justifyContent: 'space-between',
									gap: 8,
									marginBottom: notification.title ? 4 : 0,
								}}
							>
								<strong style={{ fontSize: '0.82rem', fontWeight: 700 }}>{notification.title}</strong>

								{dismissible && (
									<button
										type="button"
										aria-label="Dismiss notification"
										onClick={() => onDismiss(notification.id)}
										style={{
											border: 'none',
											background: 'transparent',
											color: 'inherit',
											fontWeight: 700,
											cursor: 'pointer',
											lineHeight: 1,
											padding: 0,
										}}
									>
										x
									</button>
								)}
							</header>
						)}

						<p
							style={{
								margin: 0,
								padding: '0 2px',
								textAlign: 'center',
								fontSize: '0.9rem',
								lineHeight: 1.5,
								fontWeight: 500,
								letterSpacing: '0.01em',
								opacity: 0.95,
								fontFamily: 'Kind sans, sans-serif',
							}}
						>
							{notification.message}
						</p>

						{notification.actionLabel && notification.onAction && (
							<div style={{ marginTop: 8 }}>
								<button
									type="button"
									onClick={notification.onAction}
									style={{
										border: '1px solid rgba(255, 255, 255, 0.36)',
										borderRadius: 9,
										background: 'rgba(255, 255, 255, 0.1)',
										color: '#fff',
										cursor: 'pointer',
										padding: '0.2rem 0.45rem',
										fontSize: '0.74rem',
									}}
								>
									{notification.actionLabel}
								</button>
							</div>
						)}
					</section>
				);
			})}
		</aside>
	);
}

export default Notifications;