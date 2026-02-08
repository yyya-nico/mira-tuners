import './style.css'

type TunerUser = {
	id: string
	agent?: string
	priority: number
}

type Tuner = {
	index: number
	name: string
	types: string[]
	command: string | null
	pid: number | null
	users: TunerUser[]
	isAvailable: boolean
	isRemote: boolean
	isFree: boolean
	isUsing: boolean
	isFault: boolean
}

const formatStatus = (tuner: Tuner) => {
	const status: { label: string; tone: 'ok' | 'warn' | 'info' | 'fault' }[] = []
	if (tuner.isUsing) status.push({ label: '使用中', tone: 'ok' })
	if (tuner.isFree) status.push({ label: '空き', tone: 'info' })
	return status
}

const updateTuners = async () => {
	const tuners: Tuner[] = await fetch('/api/tuners').then((res) => res.json())
	return `
				${tuners
					.map((tuner) => {
						const statuses = formatStatus(tuner)
							.map(
								(status) =>
									`<span class="chip chip--${status.tone}">${status.label}</span>`
							)
							.join('')
						const command = tuner.command && tuner.pid
							? `<div class="command-block">
								<p class="command">${tuner.command}</p>
								<span class="command-meta">pid=${tuner.pid}</span>
							</div>`
							: ''
						const users = tuner.users.length
							?
							`<div class="users-block">
								<div class="users-head">
									<span>id</span>
									<span>agent</span>
									<span>優先度</span>
								</div>
								<div class="users-body">${
								tuner.users
								.map(
									(user) => `
									<div class="user-row">
										<div class="user-id">${user.id}</div>
										<div class="user-agent">${user.agent ?? '—'}</div>
										<div class="user-priority">${user.priority}</div>
									</div>
								`
								)
								.join('')
								}</div>
							</div>`
							: ''

						return `
							<article class="tuner-card">
								<div class="tuner-head">
									<h2><span class="tuner-index">#${tuner.index}</span>${tuner.name}</h2>
									<p class="tuner-meta">
										<span class="types">${tuner.types
											.map(
												(type) => `<span class="type">${type}</span>`
											).join('')}</span>
										<span class="status">${statuses}</span>
									</p>
								</div>
								${command}
								${users}
							</article>
						`
					})
					.join('')}
  `
}

const section = document.querySelector<HTMLElement>('section')

if (section) {
	section.innerHTML = await updateTuners()

	setInterval(async () => {
		section.innerHTML = await updateTuners()
	}, 30 * 1000)
}

