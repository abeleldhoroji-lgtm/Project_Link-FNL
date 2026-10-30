const STORAGE_KEY = 'projectlink_persistent_db';

// Default base users if no storage exists yet
const defaultUsers = [
  { id: 'pub-1', username: 'Abhiram', email: 'abhiram@example.com', password: 'demo123', role: 'Publisher', rating: '4.9', completed: 0, skills: ['UI Design', 'Java', 'SQL'] },
  { id: 'free-1', username: 'Meera', email: 'meera@example.com', password: 'help123', role: 'Freelancer', rating: '4.8', completed: 0, skills: ['JavaScript', 'React', 'Node.js', 'Web Development', 'Data Profiling'] }
];

function buildInitialState() {
  return {
    users: JSON.parse(JSON.stringify(defaultUsers)),
    projects: [],
    currentUser: null,
    currentProjectId: null,
    workspace: {
      tasks: [],
      messages: [],
      payments: []
    }
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return saved ? { ...buildInitialState(), ...saved } : buildInitialState();
  } catch (error) {
    return buildInitialState();
  }
}

const state = loadState();
const app = document.querySelector('#app');

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toast(message) {
  const toastNode = document.createElement('div');
  toastNode.className = 'toast';
  toastNode.textContent = message;
  document.body.appendChild(toastNode);
  setTimeout(() => toastNode.remove(), 2600);
}

function getCurrentUser() {
  return state.currentUser;
}

function getProfileSkills(user) {
  return Array.isArray(user.skills) ? user.skills : [];
}

function go(page) {
  location.hash = page;
  render();
}

function logout() {
  state.currentUser = null;
  saveState();
  go('home');
}

function nav() {
  const user = getCurrentUser();
  return `
    <header class="topbar">
      <button type="button" class="brand" onclick="go('home')">Project<span>Link</span></button>
      <nav class="nav">
        <a href="#" onclick="go('browse')">Browse projects</a>
        <a href="#" onclick="${user ? "go('dashboard')" : "go('login')"}">${user ? 'Dashboard' : 'Sign in'}</a>
        ${user ? `<div class="user-pill">${escapeHtml(user.username)} (${escapeHtml(user.role)})</div>` : '<button type="button" class="btn" onclick="go(\'register\')">Get started</button>'}
      </nav>
    </header>
  `;
}

function projectCard(project) {
  const acceptedCount = project.acceptedFreelancers ? project.acceptedFreelancers.length : 0;
  const maxSlots = project.maxSlots || 1;
  
  return `
    <article class="card project-card">
      <div class="card-head">
        <span class="tag ${project.level === 'Easy' ? 'mint' : project.level === 'Advanced' ? 'gold' : ''}">${project.level}</span>
        <span class="muted">Slots: ${acceptedCount}/${maxSlots} filled</span>
      </div>
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.description)}</p>
      <div>${project.skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join(' ')}</div>
      <div class="meta"><span>◷ ${escapeHtml(project.deadline)}</span><span>◉ ${escapeHtml(project.budget)}</span></div>
      <button type="button" class="btn secondary" onclick="openProject(${project.id})">View project & details</button>
    </article>
  `;
}

function home() {
  const user = getCurrentUser();
  return `
    ${nav()}
    <main class="hero">
      <section class="hero-copy">
        <span class="eyebrow">Student collaboration & project workflow</span>
        <h1>Find the right teammate. <em>Build something great.</em></h1>
        <p class="lead">ProjectLink bridges publishers and skilled freelancers with secure workspace discussions and payment milestones.</p>
        <div class="hero-actions">
          <button type="button" class="btn" onclick="${user ? "go('dashboard')" : "go('register')"}">${user ? 'Open dashboard' : 'Get started free →'}</button>
          <button type="button" class="btn secondary" onclick="go('browse')">Explore projects</button>
        </div>
        <div class="stats">
          <div><b>Secure</b><small>escrow payments</small></div>
          <div><b>Verified</b><small>student profiles</small></div>
        </div>
      </section>
    </main>
  `;
}

function auth(register = false) {
  return `
    ${nav()}
    <main class="auth-shell">
      <section class="auth-card">
        <h1>${register ? 'Create your account' : 'Welcome back'}</h1>
        <p class="sub">${register ? 'Register as Publisher or Freelancer.' : 'Sign in with your registered email and password.'}</p>

        <form class="auth-form" onsubmit="event.preventDefault(); handleAuthSubmit(${register});">
          ${register ? '<div class="field"><label>Username</label><input id="username" type="text" placeholder="Your username" required></div>' : ''}
          <div class="field"><label>Email</label><input id="email" type="email" placeholder="you@college.edu" required></div>
          <div class="field"><label>Password</label><input id="password" type="password" placeholder="Enter your password" required></div>
          
          <div class="field">
            <label>Account Role</label>
            <select id="auth-role" required>
              <option value="Publisher">Publisher (Post projects, review requests & manage payments)</option>
              <option value="Freelancer">Freelancer (Take up posts, request offers & track completed works)</option>
            </select>
          </div>

          <button class="btn" type="submit" style="width:100%;margin-top:12px">${register ? 'Create account' : 'Sign in'} →</button>
        </form>

        <p class="sub center">
          ${register ? 'Already have an account?' : 'Need a new account?'}
          <button type="button" class="btn ghost" onclick="go('${register ? 'login' : 'register'}')">${register ? 'Sign in' : 'Create an account'}</button>
        </p>
      </section>
    </main>
  `;
}

function handleAuthSubmit(isRegister) {
  const usernameValue = document.getElementById('username')?.value.trim() || '';
  const emailValue = (document.getElementById('email')?.value || '').trim().toLowerCase();
  const passwordValue = (document.getElementById('password')?.value || '').trim();
  const roleValue = document.getElementById('auth-role')?.value || 'Publisher';

  if (!emailValue || !passwordValue || (isRegister && !usernameValue)) {
    toast('Please enter all required details.');
    return;
  }

  if (isRegister) {
    const accountExists = state.users.some((user) => user.email.toLowerCase() === emailValue);
    if (accountExists) {
      toast('An account with this email already exists. Try signing in.');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      username: usernameValue,
      email: emailValue,
      password: passwordValue,
      role: roleValue,
      rating: '5.0',
      completed: 0,
      skills: []
    };

    state.users.push(newUser);
    state.currentUser = newUser;
    saveState();
    toast('Account created and saved successfully!');
    go('dashboard');
    return;
  }

  const validUser = state.users.find(
    (user) => user.email.toLowerCase() === emailValue && user.password === passwordValue
  );

  if (!validUser) {
    toast('Invalid credentials or email not found. Please check or register.');
    return;
  }

  state.currentUser = validUser;
  saveState();
  toast(`Welcome back, ${validUser.username}!`);
  go('dashboard');
}

function sidebar(active) {
  const user = getCurrentUser();
  const isPublisher = user?.role === 'Publisher';

  return `
    <aside class="sidebar">
      <p class="side-label">WORKSPACE</p>
      ${[
        ['dashboard', '⌂', 'Overview'],
        ['browse', '⌕', 'Browse projects'],
        ...(isPublisher ? [['create', '＋', 'Post project'], ['offers', '◈', 'Review Offers']] : []),
        ['workspace', '▣', 'Project Workspace']
      ].map(([key, icon, label]) => `
        <button type="button" class="side-link ${active === key ? 'active' : ''}" onclick="go('${key}')"><span>${icon}</span>${label}</button>
      `).join('')}
      <p class="side-label">ACCOUNT</p>
      <button type="button" class="side-link ${active === 'profile' ? 'active' : ''}" onclick="go('profile')">◉ Profile</button>
      <button type="button" class="side-link" onclick="logout()">↩ Sign out</button>
    </aside>
  `;
}

function shell(active, body) {
  return `${nav()}<div class="layout">${sidebar(active)}<main class="content">${body}</main></div>`;
}

function dashboard() {
  if (!getCurrentUser()) return auth(false);
  const user = getCurrentUser();
  const isPublisher = user.role === 'Publisher';

  const userProjects = isPublisher 
    ? state.projects.filter(p => p.createdBy === user.email)
    : state.projects.filter(p => p.acceptedFreelancers && p.acceptedFreelancers.some(f => f.email === user.email));

  return shell('dashboard', `
    <h1 class="page-title">Welcome, ${escapeHtml(user.username)} 👋</h1>
    <p class="page-intro">Role: <b>${escapeHtml(user.role)}</b>. Manage your workflow, projects, and active workspaces.</p>

    <div class="dashboard-actions" style="display:flex;flex-wrap:wrap;gap:12px;margin-top:15px;">
      ${isPublisher ? '<button type="button" class="btn" onclick="go(\'create\')">+ Post a new project</button>' : ''}
      <button type="button" class="btn secondary" onclick="go('browse')">Browse all projects</button>
    </div>

    <section class="grid four" style="margin-top:20px;">
      <article class="card stat-card"><span class="icon">📌</span><b>${state.projects.length}</b><small>Platform Projects</small></article>
      <article class="card stat-card"><span class="icon">◈</span><b>${userProjects.length}</b><small>Your Active Works</small></article>
      <article class="card stat-card"><span class="icon">★</span><b>${user.rating || '5.0'}</b><small>User Rating</small></article>
      <article class="card stat-card"><span class="icon">✓</span><b>${user.completed || 0}</b><small>Completed Works</small></article>
    </section>

    <h2 class="section-title">${isPublisher ? 'Projects you published' : 'Projects you are working on'}</h2>
    <section class="grid two">${userProjects.map(projectCard).join('') || '<div class="card empty">No projects found here. Post or browse projects to begin.</div>'}</section>
  `);
}

function browse() {
  const user = getCurrentUser();
  const userSkills = user && user.skills ? user.skills.map(s => s.toLowerCase()) : [];

  const sortedProjects = [...state.projects].sort((a, b) => {
    const aMatch = a.skills.some(s => userSkills.includes(s.toLowerCase())) ? 1 : 0;
    const bMatch = b.skills.some(s => userSkills.includes(s.toLowerCase())) ? 1 : 0;
    return bMatch - aMatch;
  });

  return shell('browse', `
    <h1 class="page-title">Explore projects</h1>
    <p class="page-intro">Projects recommended based on your skills and capabilities.</p>
    <div class="toolbar">
      <input class="search" id="search" oninput="filterProjects()" placeholder="Search project, skill...">
      <select class="filter" id="category" onchange="filterProjects()">
        <option value="">All categories</option>
        <option>Web Development</option>
        <option>Data Profiling</option>
        <option>Machine Learning</option>
        <option>UI/UX Design</option>
      </select>
    </div>
    <section class="grid two" id="project-grid">${sortedProjects.map(projectCard).join('') || '<div class="card empty">No projects available yet. Publishers can post new projects.</div>'}</section>
  `);
}

function filterProjects() {
  const searchValue = document.querySelector('#search')?.value.toLowerCase() || '';
  const categoryValue = document.querySelector('#category')?.value || '';

  const results = state.projects.filter((project) => {
    const haystack = JSON.stringify(project).toLowerCase();
    return haystack.includes(searchValue) && (!categoryValue || project.category === categoryValue);
  });

  const grid = document.querySelector('#project-grid');
  if (!grid) return;
  grid.innerHTML = results.length ? results.map(projectCard).join('') : '<div class="card empty">No projects match those filters.</div>';
}

function openProject(id) {
  state.currentProjectId = id;
  go('project');
}

function project() {
  const currentProject = state.projects.find((project) => project.id === state.currentProjectId);
  if (!currentProject) return browse();

  const user = getCurrentUser();
  const isFreelancer = user && user.role === 'Freelancer';
  const isOwner = user && currentProject.createdBy === user.email;
  const acceptedCount = currentProject.acceptedFreelancers ? currentProject.acceptedFreelancers.length : 0;
  const maxSlots = currentProject.maxSlots || 1;
  const isFull = acceptedCount >= maxSlots;
  const alreadyRequested = currentProject.offers && currentProject.offers.some(o => o.freelancerEmail === user?.email);

  return shell('browse', `
    <button type="button" class="btn ghost" onclick="go('browse')">← Back to projects</button>
    <section class="detail-hero">
      <span class="tag">${escapeHtml(currentProject.category)}</span>
      <h1>${escapeHtml(currentProject.title)}</h1>
      <p>${escapeHtml(currentProject.description)}</p>
      <div class="meta">
        <span>Budget: ${escapeHtml(currentProject.budget)}</span>
        <span>Due ${escapeHtml(currentProject.deadline)}</span>
        <span>Slots Filled: ${acceptedCount}/${maxSlots}</span>
      </div>
    </section>

    <section class="split">
      <div class="card">
        <h2 class="section-title" style="margin-top:0">Project Specifications</h2>
        <p class="muted">Published by <b>${escapeHtml(currentProject.ownerName)}</b></p>

        <h2 class="section-title">Required Skills</h2>
        <div>${currentProject.skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join(' ')}</div>

        <h2 class="section-title">Accepted Team Members (${acceptedCount}/${maxSlots})</h2>
        <div>
          ${currentProject.acceptedFreelancers && currentProject.acceptedFreelancers.length > 0 ? 
            currentProject.acceptedFreelancers.map(f => `<div class="list-item"><b>${escapeHtml(f.name)}</b> <span class="muted">(${escapeHtml(f.email)}) - Amount: ₹${f.amount}</span><span class="tag mint" style="float:right">Active</span></div>`).join('') :
            '<p class="muted">No freelancers accepted yet.</p>'
          }
        </div>
      </div>

      <aside class="card">
        <span class="tag mint">Slots: ${maxSlots} max capacity</span>
        <h2 class="section-title">Freelancer Action</h2>
        ${!user ? '<p class="muted">Please sign in as a Freelancer to request an offer.</p><button type="button" class="btn" onclick="go(\'login\')">Sign in</button>' : ''}
        ${isOwner ? '<p class="muted">You are the publisher of this project.</p>' : ''}
        ${isFreelancer && !isFull && !alreadyRequested ? `
          <p class="muted">Take up this post, set your proposed amount, and request an offer.</p>
          <div class="field" style="margin-top:10px;"><label>Your Proposed Amount (₹)</label><input id="offer-amount-input" type="number" placeholder="5500" value="5500"></div>
          <div class="field" style="margin-top:10px;"><label>Proposal Note</label><textarea id="offer-note-input" placeholder="Explain your approach..."></textarea></div>
          <button type="button" class="btn" style="width:100%;margin-top:12px;" onclick="submitOfferRequest(${currentProject.id})">Request Offer</button>
        ` : ''}
        ${isFreelancer && alreadyRequested ? '<p class="tag gold" style="display:block;text-align:center;padding:10px;">Offer requested! Awaiting publisher approval.</p>' : ''}
        ${isFreelancer && isFull ? '<p class="tag" style="display:block;text-align:center;padding:10px;">Project slot capacity is full.</p>' : ''}
      </aside>
    </section>
  `);
}

function submitOfferRequest(projectId) {
  const user = getCurrentUser();
  if (!user || user.role !== 'Freelancer') {
    toast('Only freelancers can request offers.');
    return;
  }

  const amount = document.getElementById('offer-amount-input')?.value || '5500';
  const note = document.getElementById('offer-note-input')?.value || 'Interested in taking up this post.';

  const project = state.projects.find(p => p.id === projectId);
  if (!project) return;

  if (!project.offers) project.offers = [];

  project.offers.push({
    id: Date.now().toString(),
    freelancerName: user.username,
    freelancerEmail: user.email,
    skills: user.skills || ['General'],
    rating: user.rating || '4.8',
    amount: amount,
    note: note,
    status: 'Pending'
  });

  saveState();
  toast('Offer request sent successfully to the publisher!');
  render();
}

function create() {
  const user = getCurrentUser();
  if (!user || user.role !== 'Publisher') {
    toast('Only publishers can create projects.');
    go('dashboard');
    return '';
  }

  return shell('create', `
    <h1 class="page-title">Post a new project</h1>
    <p class="page-intro">Define project parameters, budget, slots (1 to 8 people), and review incoming requests.</p>
    <section class="card form-card">
      <form onsubmit="event.preventDefault(); submitProject();">
        <div class="field"><label>Project Title</label><input id="project-title" placeholder="e.g. Data Profiling & Analytics" required></div>
        <div class="form-grid">
          <div class="field">
            <label>Category</label>
            <select id="project-category">
              <option>Web Development</option>
              <option>Data Profiling</option>
              <option>Machine Learning</option>
              <option>UI/UX Design</option>
            </select>
          </div>
          <div class="field"><label>Budget</label><input id="project-budget" placeholder="e.g. ₹5,500" required></div>
        </div>
        <div class="field"><label>Project Description</label><textarea id="project-description" placeholder="Describe requirements and details..." required></textarea></div>
        <div class="form-grid">
          <div class="field"><label>Skills Required (comma separated)</label><input id="project-skills" placeholder="Python, Data Profiling, SQL" required></div>
          <div class="field">
            <label>Slot Capacity (1 to 8 people)</label>
            <select id="project-slots">
              <option value="1">1 Person</option>
              <option value="2">2 People</option>
              <option value="3" selected>3 People</option>
              <option value="4">4 People</option>
              <option value="5">5 People</option>
              <option value="6">6 People</option>
              <option value="7">7 People</option>
              <option value="8">8 People</option>
            </select>
          </div>
        </div>
        <div class="form-grid" style="margin-top:12px;">
          <div class="field">
            <label>Difficulty Level</label>
            <select id="project-level">
              <option>Easy</option>
              <option selected>Medium</option>
              <option>Advanced</option>
            </select>
          </div>
          <div class="field"><label>Deadline</label><input id="project-deadline" type="date"></div>
        </div>
        <button class="btn" type="submit" style="margin-top:20px;">Publish Project</button>
      </form>
    </section>
  `);
}

function submitProject() {
  const title = document.getElementById('project-title')?.value.trim();
  const category = document.getElementById('project-category')?.value || 'Web Development';
  const budget = document.getElementById('project-budget')?.value.trim();
  const description = document.getElementById('project-description')?.value.trim();
  const skillsText = document.getElementById('project-skills')?.value.trim();
  const maxSlots = parseInt(document.getElementById('project-slots')?.value || '1', 10);
  const level = document.getElementById('project-level')?.value || 'Medium';
  const deadlineValue = document.getElementById('project-deadline')?.value || '';

  if (!title || !budget || !description || !skillsText) {
    toast('Please complete all required project fields.');
    return;
  }

  const user = getCurrentUser();
  const newProject = {
    id: Date.now(),
    title,
    category,
    budget,
    level,
    difficulty: level,
    skills: skillsText.split(',').map((item) => item.trim()).filter(Boolean),
    ownerName: user.username,
    ownerEmail: user.email,
    createdBy: user.email,
    maxSlots: maxSlots,
    acceptedFreelancers: [],
    offers: [],
    deadline: deadlineValue ? new Date(deadlineValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD',
    description
  };

  state.projects.unshift(newProject);
  saveState();
  toast('Project published successfully!');
  go('dashboard');
}

function offers() {
  const user = getCurrentUser();
  if (!user || user.role !== 'Publisher') {
    toast('Access restricted to publishers.');
    go('dashboard');
    return '';
  }

  const publisherProjects = state.projects.filter(p => p.createdBy === user.email);

  return shell('offers', `
    <h1 class="page-title">Review Offer Requests</h1>
    <p class="page-intro">Evaluate incoming freelancer requests for your published projects. Accept or reject profiles directly.</p>
    
    ${publisherProjects.map(proj => `
      <section class="card" style="margin-top:20px;">
        <div class="card-head">
          <div>
            <h3>${escapeHtml(proj.title)}</h3>
            <small class="muted">Slots Filled: ${proj.acceptedFreelancers.length}/${proj.maxSlots}</small>
          </div>
          <span class="tag mint">${escapeHtml(proj.budget)}</span>
        </div>
        
        <h4 class="section-title">Pending Offer Requests (${proj.offers ? proj.offers.length : 0})</h4>
        ${proj.offers && proj.offers.length > 0 ? 
          proj.offers.map(offer => `
            <div class="offer" style="background:#111417;padding:14px;border-radius:10px;margin-top:10px;">
              <div class="avatar">${offer.freelancerName[0]}</div>
              <div style="flex:1">
                <div class="row">
                  <b>${escapeHtml(offer.freelancerName)}</b>
                  <span class="tag gold">★ ${escapeHtml(offer.rating)}</span>
                </div>
                <p><b>Proposed Amount:</b> ₹${offer.amount}</p>
                <p class="muted">${escapeHtml(offer.note)}</p>
                <small class="muted">Email: ${escapeHtml(offer.freelancerEmail)}</small>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <button type="button" class="btn" onclick="respondToOffer(${proj.id}, '${offer.id}', true)">Accept (Yes)</button>
                <button type="button" class="btn secondary" onclick="respondToOffer(${proj.id}, '${offer.id}', false)">Reject (No)</button>
              </div>
            </div>
          `).join('') :
          '<p class="muted">No pending offer requests for this project.</p>'
        }
      </section>
    `).join('')}
  `);
}

function respondToOffer(projectId, offerId, accept) {
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return;

  const offerIndex = project.offers.findIndex(o => o.id === offerId);
  if (offerIndex === -1) return;

  const offer = project.offers[offerIndex];

  if (accept) {
    if (project.acceptedFreelancers.length >= project.maxSlots) {
      toast('Project slot capacity has reached its maximum limit!');
      return;
    }
    project.acceptedFreelancers.push({
      name: offer.freelancerName,
      email: offer.freelancerEmail,
      amount: offer.amount
    });

    if (!state.workspace.payments) state.workspace.payments = [];
    state.workspace.payments.unshift({
      id: Date.now().toString(),
      project: project.title,
      amount: offer.amount,
      status: 'In Escrow / Pending Release',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });

    toast(`Accepted ${offer.freelancerName}! Payment of ₹${offer.amount} added to secure escrow.`);
  } else {
    toast(`Declined offer request from ${offer.freelancerName}.`);
  }

  project.offers.splice(offerIndex, 1);
  saveState();
  render();
}

function profile() {
  if (!getCurrentUser()) return auth(false);
  const user = getCurrentUser();
  const skillList = getProfileSkills(user);
  const isPublisher = user.role === 'Publisher';

  const userProjects = isPublisher 
    ? state.projects.filter(p => p.createdBy === user.email)
    : state.projects.filter(p => p.acceptedFreelancers && p.acceptedFreelancers.some(f => f.email === user.email));

  const paymentsHistory = state.workspace.payments || [];

  return shell('profile', `
    <h1 class="page-title">Your Profile</h1>
    <p class="page-intro">Account details, expertise, and secure payment ledger.</p>
    <section class="grid two">
      <article class="card">
        <div class="row">
          <div class="avatar" style="width:62px;height:62px;font-size:20px">${escapeHtml(user.username.slice(0, 2).toUpperCase())}</div>
          <div style="flex:1">
            <h2 style="margin:0;font-family:Outfit, sans-serif">${escapeHtml(user.username)}</h2>
            <p class="muted" style="margin:4px 0">Role: ${escapeHtml(user.role)}</p>
          </div>
          <span class="tag mint">Verified</span>
        </div>
        <div class="list-item"><b>Email</b><span class="muted" style="float:right">${escapeHtml(user.email)}</span></div>
        <div class="list-item"><b>Role</b><span class="muted" style="float:right">${escapeHtml(user.role)}</span></div>
        <div class="list-item"><b>Rating</b><span style="float:right">★ ${user.rating || '5.0'}</span></div>
      </article>

      <article class="card">
        <h2 class="section-title" style="margin-top:0">Skills & Strengths</h2>
        <div id="skills">${skillList.length > 0 ? skillList.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join(' ') : '<span class="muted">No skills added yet.</span>'}</div>
        <div class="field" style="margin-top:15px;"><label>Add a Skill</label><input id="skill-input" placeholder="e.g. Data Profiling"></div>
        <button type="button" class="btn secondary" style="margin-top:10px;" onclick="addSkill()">Add Skill</button>
      </article>
    </section>

    <h2 class="section-title">${isPublisher ? 'Projects Built by Publisher' : 'Completed Works & Assignments'}</h2>
    <section class="grid two">${userProjects.map(projectCard).join('') || '<div class="card empty">No projects listed yet.</div>'}</section>

    <h2 class="section-title">Secure Payment Ledger (Visible only to authorized parties)</h2>
    <section class="card">
      <p class="muted">Tracks payments from Publisher to Freelancer for accepted project milestones.</p>
      ${paymentsHistory.length > 0 ? 
        paymentsHistory.map(pay => `
          <div class="list-item">
            <b>${escapeHtml(pay.project)}</b> - Amount: <b>₹${escapeHtml(pay.amount)}</b> (${escapeHtml(pay.status)})
            <span class="tag mint" style="float:right">${escapeHtml(pay.date)}</span>
          </div>
        `).join('') :
        '<p class="muted">No payment records available yet.</p>'
      }
    </section>
  `);
}

function addSkill() {
  const input = document.querySelector('#skill-input');
  if (!input) return;
  const value = input.value.trim();
  if (!value) {
    toast('Enter a skill first.');
    return;
  }
  const user = getCurrentUser();
  if (!user.skills) user.skills = [];
  if (!user.skills.includes(value)) {
    user.skills.push(value);
    saveState();
    toast('Skill added successfully.');
    render();
  } else {
    toast('Skill already exists.');
  }
}

function workspace() {
  const user = getCurrentUser();
  return shell('workspace', `
    <h1 class="page-title">Project Workspace & Discussions</h1>
    <p class="page-intro">Interactive project room where publishers and freelancers collaborate and send project details.</p>
    
    <section class="grid two">
      <article class="card">
        <h2 class="section-title">Project Tasks & Deliverables</h2>
        ${state.workspace.tasks.length > 0 ? state.workspace.tasks.map((task, index) => `
          <div class="task">
            <button type="button" class="check ${task[1] ? 'done' : ''}" onclick="toggleTask(${index})"></button>
            <span style="flex:1;${task[1] ? 'text-decoration:line-through;color:#8a94a5' : ''}">${escapeHtml(task[0])}</span>
            <span class="tag">${task[1] ? 'Done' : 'To do'}</span>
          </div>
        `).join('') : '<p class="muted">No tasks in workspace yet. Tasks appear once collaboration begins.</p>'}
      </article>

      <article class="card">
        <h2 class="section-title">Project Discussion & Details Exchange</h2>
        <div style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
          ${state.workspace.messages.length > 0 ? state.workspace.messages.map(([author, message]) => `
            <div class="message ${author === user?.username ? 'mine' : ''}"><b>${escapeHtml(author)}</b><br>${escapeHtml(message)}</div>
          `).join('') : '<p class="muted">No messages in discussion yet.</p>'}
        </div>
        <div class="row" style="margin-top:15px">
          <input class="search" id="chat-input" placeholder="Discuss requirements, send details...">
          <button type="button" class="btn" onclick="sendMessage()">Send</button>
        </div>
      </article>
    </section>

    <h2 class="section-title">Workspace Payment Details</h2>
    <section class="card">
      <p class="muted">Secure payment status for active project engagement.</p>
      ${(state.workspace.payments || []).length > 0 ? (state.workspace.payments).map(pay => `
        <div class="list-item">
          <b>${escapeHtml(pay.project)}</b> - ₹${escapeHtml(pay.amount)} 
          <span class="tag gold" style="float:right">${escapeHtml(pay.status)}</span>
        </div>
      `).join('') : '<p class="muted">No active workspace payments recorded yet.</p>'}
    </section>
  `);
}

function toggleTask(index) {
  state.workspace.tasks[index][1] = !state.workspace.tasks[index][1];
  saveState();
  render();
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const user = getCurrentUser();
  if (!input || !input.value.trim() || !user) return;
  state.workspace.messages.push([user.username, input.value.trim()]);
  saveState();
  render();
}

function render() {
  const page = location.hash.slice(1) || 'home';
  const validPages = ['home', 'login', 'register', 'browse', 'dashboard', 'project', 'create', 'offers', 'profile', 'workspace'];
  const selectedPage = validPages.includes(page) ? page : 'home';
  const user = getCurrentUser();

  if (['dashboard', 'create', 'offers', 'profile', 'workspace'].includes(selectedPage) && !user) {
    app.innerHTML = auth(false);
    return;
  }

  const pages = {
    home,
    login: () => auth(false),
    register: () => auth(true),
    dashboard,
    browse,
    project,
    create,
    offers,
    profile,
    workspace
  };

  app.innerHTML = (pages[selectedPage] || home)();
}

window.onhashchange = render;
render();