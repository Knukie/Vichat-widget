function createSidebarItem(agent, isActive, onSelect) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'valki-sidebar-item';
  if (isActive) button.classList.add('is-active');
  button.dataset.agentId = agent.id;
  button.setAttribute('aria-label', `Chat with ${agent.name}`);

  const avatar = document.createElement('img');
  avatar.className = 'valki-sidebar-avatar';
  avatar.src = agent.avatarUrl;
  avatar.alt = `${agent.name} avatar`;

  const content = document.createElement('div');
  content.className = 'valki-sidebar-content';

  const name = document.createElement('div');
  name.className = 'valki-sidebar-name';
  name.textContent = agent.name;

  const subtitle = document.createElement('div');
  subtitle.className = 'valki-sidebar-subtitle';
  subtitle.textContent = agent.description || '';

  content.appendChild(name);
  content.appendChild(subtitle);

  button.appendChild(avatar);
  button.appendChild(content);

  button.addEventListener('click', () => onSelect?.(agent.id));

  return button;
}

export function createSidebarController({ listEl, onSelect }) {
  function renderAgents(agents = [], currentAgentId) {
    if (!listEl) return;
    listEl.innerHTML = '';
    const safeAgents = Array.isArray(agents) ? agents : [];
    safeAgents.forEach((agent) => {
      const isActive = agent.id === currentAgentId;
      listEl.appendChild(createSidebarItem(agent, isActive, onSelect));
    });
  }

  return { renderAgents };
}
