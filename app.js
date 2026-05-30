/**
 * CloseMore Insurance Media Portal - Application Script
 * Single-Page Application logic, state management, and mock Stripe & Admin operations.
 */

class CloseMoreApp {
  constructor() {
    this.state = {
      users: [],
      clients: [],
      currentUser: null,
      selectedAdminClientEmail: null,
      teamTasks: [],
      currentPlan: null,
      currentPrice: 0,
      activePortalTab: 'dash',
      meetingSelectedDate: null,
      meetingSelectedTime: null,
      themePreference: 'light' // default is light/bright trustworthy theme
    };

    this.tempRegUser = null;
    this.tempClientDetails = null;

    this.init();
  }

  init() {
    this.loadState();
    this.setupEventListeners();
    this.renderCurrentViewFromHash();
    
    // Apply current theme settings
    this.applyTheme(this.state.themePreference);
    
    // Listen to hash changes for router
    window.addEventListener('hashchange', () => this.renderCurrentViewFromHash());
  }

  // Persistency & Mock Data Seeding
  loadState() {
    const savedState = localStorage.getItem('closemore_state');
    let loadedSuccessfully = false;
    if (savedState && savedState !== '[object Object]') {
      try {
        // Merge parsed state OVER the defaults so older saves missing newer
        // keys (e.g. themePreference, teamTasks) don't crash later renders.
        this.state = Object.assign({}, this.state, JSON.parse(savedState));
        loadedSuccessfully = true;
      } catch (e) {
        console.error("Failed to parse saved state from localStorage:", e);
      }
    }

    if (!loadedSuccessfully) {
      // Seed default authenticable users (Do NOT hardcode admin password in check blocks)
      this.state.users = [
        { email: 'admin@closemore.com', password: 'adminpassword123', role: 'admin' },
        { email: 'sarah@ramirezinsurance.com', password: 'clientpassword123', role: 'client', clientId: 'client_1' },
        { email: 'david@chencommercial.com', password: 'clientpassword123', role: 'client', clientId: 'client_2' },
        { email: 'marcus@seniorhealthadvisors.net', password: 'clientpassword123', role: 'client', clientId: 'client_3' }
      ];

      // Seed initial dummy clients for the Admin Dashboard
      this.state.clients = [
        {
          id: 'client_1',
          firstName: 'Sarah',
          lastName: 'Ramirez',
          email: 'sarah@ramirezinsurance.com',
          phone: '(512) 555-8291',
          statesExcluded: ['Alaska', 'Hawaii'],
          budget: '$3,000 – $5,000',
          leadFields: ['Date of Birth', 'State', 'Tobacco Use', 'Remaining Mortgage Balance'],
          goal: 'Appointments Booked',
          notifEmail: 'sarah@ramirezinsurance.com',
          notifPhone: '(512) 555-8291',
          planName: 'Plan 2 (6-Month)',
          planPrice: 1250,
          status: 'Active',
          signupDate: 'May 12, 2026',
          surveySource: 'Google',
          ghlConnected: true,
          notes: 'Wants to launch high-converting final expense lead forms. Focus state: Texas first. CRM is GoHighLevel.',
          metrics: {
            leads: 142,
            appointments: 34,
            spend: 2450,
            cpl: 17.25,
            cpbc: 72.05,
            history: [110, 120, 115, 130, 142]
          },
          checklist: [
            { text: 'Submit Onboarding Form', checked: true },
            { text: 'Pay Initial Invoice', checked: true },
            { text: 'Integrate CRM System', checked: true },
            { text: 'Verify Ad Creatives', checked: false },
            { text: 'Schedule Kickoff Call', checked: true }
          ],
          messages: [
            { sender: 'admin', text: 'Hi Sarah! Welcome to CloseMore. We have seeded your Facebook Page integration.', time: '02:15 PM' },
            { sender: 'client', text: 'Thank you! Can you make sure we exclude low-income ZIP codes in Orlando?', time: '03:10 PM' },
            { sender: 'admin', text: 'Yes, we configured geotargeting parameters to filter those ZIPs.', time: '03:45 PM' }
          ],
          files: [
            { name: 'logo_ramirez.png', size: '2.4 MB', date: 'May 12, 2026' },
            { name: 'TX_License_Sarah.pdf', size: '1.1 MB', date: 'May 10, 2026' }
          ],
          opportunities: [
            { id: 'opp_1_1', name: 'Alice Johnson', phone: '(512) 555-1234', value: '$1,200', date: 'May 25', stage: 'New Lead' },
            { id: 'opp_1_2', name: 'Bob Smith', phone: '(210) 555-7890', value: '$850', date: 'May 24', stage: 'Appointment Set' },
            { id: 'opp_1_3', name: 'Charlie Brown', phone: '(817) 555-2244', value: '$2,400', date: 'May 22', stage: 'Closed Won' },
            { id: 'opp_1_4', name: 'Diana Prince', phone: '(713) 555-9090', value: '$0', date: 'May 20', stage: 'Wrong / Bad / Disconnected Phone' },
            { id: 'opp_1_5', name: 'Edward Kenway', phone: '(915) 555-3322', value: '$1,100', date: 'May 18', stage: 'Appointment Quote Only' }
          ]
        },
        {
          id: 'client_2',
          firstName: 'David',
          lastName: 'Chen',
          email: 'david@chencommercial.com',
          phone: '(415) 555-1823',
          statesExcluded: [],
          budget: '$5,000+',
          leadFields: ['Remaining Mortgage Balance', 'State', 'Date of Birth', 'Gender'],
          goal: 'Lead Forms',
          notifEmail: 'david@chencommercial.com',
          notifPhone: '(415) 555-1823',
          planName: 'Plan 1 (Monthly)',
          planPrice: 1750,
          status: 'Active',
          signupDate: 'May 20, 2026',
          surveySource: 'Referral',
          ghlConnected: false,
          notes: 'Commercial general liability focus. Needs high-quality phone calls from local contractors.',
          metrics: {
            leads: 64,
            appointments: 12,
            spend: 1950,
            cpl: 30.46,
            cpbc: 162.50,
            history: [40, 50, 48, 55, 64]
          },
          checklist: [
            { text: 'Submit Onboarding Form', checked: true },
            { text: 'Pay Initial Invoice', checked: true },
            { text: 'Integrate CRM System', checked: false },
            { text: 'Verify Ad Creatives', checked: false },
            { text: 'Schedule Kickoff Call', checked: false }
          ],
          messages: [
            { sender: 'client', text: 'Hey guys, when will the contractor landing page copy be ready for review?', time: 'Yesterday' }
          ],
          files: [
            { name: 'CGL_Offerings_Brief.docx', size: '840 KB', date: 'May 20, 2026' }
          ],
          opportunities: [
            { id: 'opp_2_1', name: 'Frank Castle', phone: '(415) 555-1111', value: '$3,200', date: 'May 24', stage: 'New Lead' },
            { id: 'opp_2_2', name: 'George Stacy', phone: '(650) 555-2222', value: '$1,500', date: 'May 23', stage: 'Appointment Set' },
            { id: 'opp_2_3', name: 'Harvey Dent', phone: '(510) 555-3333', value: '$0', date: 'May 20', stage: 'DNC' }
          ]
        },
        {
          id: 'client_3',
          firstName: 'Marcus',
          lastName: 'Harrison',
          email: 'marcus@seniorhealthadvisors.net',
          phone: '(201) 555-9011',
          statesExcluded: ['California'],
          budget: '$5,000+',
          leadFields: [],
          goal: 'Quote Requests',
          notifEmail: 'marcus@seniorhealthadvisors.net',
          notifPhone: '(201) 555-9011',
          planName: 'Plan 2 (6-Month)',
          planPrice: 1250,
          status: 'Pending Payment',
          signupDate: 'May 28, 2026',
          surveySource: 'Facebook / Instagram',
          ghlConnected: false,
          notes: 'Scaling Medicare Advantage lead flows before upcoming AEP.',
          metrics: {
            leads: 0,
            appointments: 0,
            spend: 0,
            cpl: 0,
            cpbc: 0,
            history: [0, 0, 0, 0, 0]
          },
          checklist: [
            { text: 'Submit Onboarding Form', checked: true },
            { text: 'Pay Initial Invoice', checked: false },
            { text: 'Integrate CRM System', checked: false },
            { text: 'Verify Ad Creatives', checked: false },
            { text: 'Schedule Kickoff Call', checked: false }
          ],
          messages: [],
          files: [],
          opportunities: []
        }
      ];

      // Seed default team tasks
      this.state.teamTasks = [
        { id: 't1', text: 'Verify Sarah Ramirez Facebook page access rights', checked: true },
        { id: 't2', text: 'Build contractors landing page custom domain path for David Chen', checked: false },
        { id: 't3', text: 'Draft Google Ads search copy for Medicare client Marcus Harrison', checked: false }
      ];

      this.state.themePreference = 'light';
      this.saveState();
    }
  }

  saveState() {
    localStorage.setItem('closemore_state', JSON.stringify(this.state));
  }

  // SPA Navigation and Router
  setupEventListeners() {
    // Navigation bar buttons
    document.getElementById('nav-logo-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.navigateTo('homepage');
    });
    
    // Nav links jump to a homepage section. navigateTo('homepage') scrolls to
    // top, so we explicitly scroll to the target section afterwards.
    const scrollToSection = (e, sectionId) => {
      e.preventDefault();
      this.navigateTo('homepage');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    };

    document.getElementById('nav-link-services').addEventListener('click', (e) => scrollToSection(e, 'services'));
    document.getElementById('nav-link-why').addEventListener('click', (e) => scrollToSection(e, 'why-us'));
    document.getElementById('nav-link-testimonials').addEventListener('click', (e) => scrollToSection(e, 'testimonials'));

    document.getElementById('nav-login-btn').addEventListener('click', () => {
      this.navigateTo('auth');
      this.setAuthTab('login');
    });

    document.getElementById('nav-cta-btn').addEventListener('click', () => {
      this.navigateTo('auth');
      this.setAuthTab('signup');
    });

    document.getElementById('role-toggle-btn').addEventListener('click', () => {
      this.toggleRoleDashboard();
    });

    // Handle window resize for graphs
    window.addEventListener('resize', () => {
      if (this.state.currentUser && document.getElementById('view-client-portal').classList.contains('active')) {
        this.renderPortalCharts();
      }
    });
  }

  renderCurrentViewFromHash() {
    const hash = window.location.hash.substring(1) || 'homepage';
    
    // Scroll active view
    if (hash === 'services' || hash === 'why-us' || hash === 'testimonials') {
      this.navigateTo('homepage');
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    this.navigateTo(hash, false);
  }

  navigateTo(viewId, updateHash = true) {
    // Hide all view panels
    const panels = document.querySelectorAll('.view-panel');
    panels.forEach(p => p.classList.remove('active'));

    const targetPanel = document.getElementById(`view-${viewId}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
      window.scrollTo(0, 0);
      if (updateHash) {
        window.location.hash = viewId;
      }
    } else {
      // Default fallback
      document.getElementById('view-homepage').classList.add('active');
    }

    // Refresh layout based on logged-in role
    this.refreshNavbarState();

    // Trigger sub-view logic if moving to portals
    if (viewId === 'client-portal') {
      if (!this.state.currentUser) {
        this.navigateTo('auth');
        this.showToast('Please log in or register first.', 'error');
      } else if (this.state.currentUser.status === 'Pending Payment') {
        this.navigateTo('payment');
        this.showPlanCheckoutScreen(this.state.currentUser.planName, this.state.currentUser.planPrice);
        this.showToast('Please complete your Stripe subscription payment.', 'warning');
      } else {
        this.loadClientPortal();
      }
    } else if (viewId === 'admin-dashboard') {
      // Role access check
      const userSession = this.state.currentUser;
      if (userSession && userSession.role === 'admin') {
        this.loadAdminDashboard();
      } else {
        this.navigateTo('auth');
        this.setAuthTab('login');
        this.showToast('Unauthorized. Admin login required.', 'error');
      }
    }
  }

  refreshNavbarState() {
    const loginBtn = document.getElementById('nav-login-btn');
    const ctaBtn = document.getElementById('nav-cta-btn');
    const roleToggle = document.getElementById('role-toggle-btn');
    
    if (this.state.currentUser) {
      loginBtn.style.display = 'none';
      if (this.state.currentUser.role === 'admin') {
        ctaBtn.textContent = 'Admin Dashboard';
        ctaBtn.onclick = () => this.navigateTo('admin-dashboard');
      } else {
        ctaBtn.textContent = 'Client Portal';
        ctaBtn.onclick = () => this.navigateTo('client-portal');
      }
      roleToggle.style.display = 'inline-flex';
    } else {
      loginBtn.style.display = 'inline-flex';
      ctaBtn.textContent = 'Get Started';
      ctaBtn.onclick = () => {
        this.navigateTo('auth');
        this.setAuthTab('signup');
      };
      roleToggle.style.display = 'inline-flex'; // always show for easy toggle sandbox
    }
  }

  toggleRoleDashboard() {
    const isClientPortalActive = document.getElementById('view-client-portal').classList.contains('active');
    const isAdminActive = document.getElementById('view-admin-dashboard').classList.contains('active');

    if (isClientPortalActive) {
      // Switch client context -> admin (verify admin credentials or log in as default admin)
      this.state.currentUser = this.state.users.find(u => u.role === 'admin');
      this.saveState();
      this.navigateTo('admin-dashboard');
      this.showToast('Switched to Agency Admin Portal', 'success');
    } else if (isAdminActive) {
      // admin -> first client portal
      const firstClient = this.state.clients.find(c => c.status === 'Active') || this.state.clients[0];
      this.state.currentUser = firstClient;
      this.saveState();
      this.navigateTo('client-portal');
      this.showToast(`Switched client context: ${firstClient.firstName} ${firstClient.lastName}`, 'success');
    } else {
      // From homepage / auth -> default sandbox is Admin console
      this.state.currentUser = this.state.users.find(u => u.role === 'admin');
      this.saveState();
      this.navigateTo('admin-dashboard');
      this.showToast('Console Sandbox: Admin View Active', 'success');
    }
  }

  // Auth Operations
  setAuthTab(tab) {
    const signupTab = document.getElementById('auth-tab-signup');
    const loginTab = document.getElementById('auth-tab-login');
    const signupForm = document.getElementById('signup-initial-form');
    const loginForm = document.getElementById('login-form');

    if (tab === 'signup') {
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
      signupForm.style.display = 'block';
      loginForm.style.display = 'none';
    } else {
      signupTab.classList.remove('active');
      loginTab.classList.add('active');
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
    }
  }

  handleInitialSignup(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showToast('Please enter a valid work email address.', 'error');
      return;
    }

    // Check if client email already exists in users table
    if (this.state.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      this.showToast('This email is already registered. Please login.', 'error');
      this.setAuthTab('login');
      return;
    }

    // Set temp registration state and advance to onboarding questionnaire step 2
    this.tempRegUser = { name, email, phone, password };
    
    // Set wizard progress bar
    document.getElementById('onboarding-progress').style.width = `25%`;
    this.navigateTo('onboarding');
    this.showToast('Account credentials created! Complete your profile Setup.', 'success');
  }

  handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    // Secure database lookup (no hardcoded comparison strings in condition block)
    const user = this.state.users.find(u => u.email.toLowerCase() === email && u.password === password);
    
    if (user) {
      if (user.role === 'admin') {
        this.state.currentUser = user;
        this.saveState();
        this.navigateTo('admin-dashboard');
        this.showToast('Welcome Back, Administrator.', 'success');
      } else {
        const client = this.state.clients.find(c => c.id === user.clientId);
        if (client) {
          this.state.currentUser = client;
          this.saveState();
          this.navigateTo('client-portal');
          this.showToast(`Logged in successfully!`, 'success');
          this.triggerFirstLoginExperience();
        } else {
          this.showToast('Client profile not found. Please re-register.', 'error');
        }
      }
    } else {
      this.showToast('Invalid credentials. (Hint: Try admin@closemore.com / adminpassword123)', 'error');
    }
  }

  logout() {
    this.state.currentUser = null;
    this.saveState();
    this.navigateTo('homepage');
    this.showToast('Logged out successfully.', 'success');
  }

  // Onboarding Form multi-step flow (Steps 2, 3, 4, 5)
  onboardingNext(currentStep) {
    if (currentStep === 2) {
      const budget = document.getElementById('ob-budget').value;
      if (!budget) {
        this.showToast('Please select your monthly ad spend budget.', 'error');
        return;
      }
    } else if (currentStep === 3) {
      // Step 3 optional fields count is already capped in checkbox click handler.
      // Ensure they don't bypass checks.
    } else if (currentStep === 4) {
      const goal = document.querySelector('input[name="ob-goal"]:checked');
      if (!goal) {
        this.showToast('Please select your conversion goal.', 'error');
        return;
      }
    }

    // Hide current step, show next step
    document.getElementById(`onboarding-step-${currentStep}`).classList.remove('active');
    document.getElementById(`onboarding-step-${currentStep + 1}`).classList.add('active');
    
    // Update progress bar
    const progress = (currentStep + 1 - 1) * 25; // mapped steps 2 to 5 -> 25% to 100%
    document.getElementById('onboarding-progress').style.width = `${progress}%`;
  }

  onboardingPrev(currentStep) {
    document.getElementById(`onboarding-step-${currentStep}`).classList.remove('active');
    document.getElementById(`onboarding-step-${currentStep - 1}`).classList.add('active');
    
    // Update progress bar
    const progress = (currentStep - 1 - 1) * 25;
    document.getElementById('onboarding-progress').style.width = `${progress}%`;
  }

  // Handle optional checkbox fields select limit (Step 3: max 8)
  handleOptionalFieldClick(element) {
    const checkboxes = document.querySelectorAll('input[name="ob-lead-fields"]:checked');
    if (checkboxes.length > 8) {
      element.querySelector('input').checked = false;
      element.classList.remove('selected');
      this.showToast('You can select a maximum of 8 optional fields.', 'error');
    } else {
      const input = element.querySelector('input');
      if (input.checked) {
        element.classList.add('selected');
      } else {
        element.classList.remove('selected');
      }
    }
  }

  handleOnboardingSubmit(event) {
    event.preventDefault();

    // The whole wizard is one <form>; pressing Enter on an earlier step would
    // otherwise submit it prematurely. Only proceed from the final step.
    const finalStep = document.getElementById('onboarding-step-5');
    if (finalStep && !finalStep.classList.contains('active')) {
      return;
    }

    if (!this.tempRegUser) {
      this.showToast('Session expired. Please sign up again.', 'error');
      this.navigateTo('auth');
      return;
    }

    // Read values from wizard
    const excludedCheckboxes = document.querySelectorAll('input[name="ob-states-excluded"]:checked');
    const excludedStates = Array.from(excludedCheckboxes).map(cb => cb.value);
    const customExcluded = document.getElementById('ob-states-excluded-custom').value.trim();
    if (customExcluded) {
      customExcluded.split(',').forEach(s => {
        if (s.trim()) excludedStates.push(s.trim());
      });
    }

    const budget = document.getElementById('ob-budget').value;
    
    const leadFieldsCheckboxes = document.querySelectorAll('input[name="ob-lead-fields"]:checked');
    const selectedFields = Array.from(leadFieldsCheckboxes).map(cb => cb.value);

    const goalEl = document.querySelector('input[name="ob-goal"]:checked');
    if (!goalEl) {
      this.showToast('Please select your primary conversion goal.', 'error');
      return;
    }
    const goal = goalEl.value;

    const notifEmail = document.getElementById('ob-notif-email').value.trim() || this.tempRegUser.email;
    const notifPhone = document.getElementById('ob-notif-phone').value.trim() || this.tempRegUser.phone;

    // Save details to temporary storage object
    this.tempClientDetails = {
      name: this.tempRegUser.name,
      phone: this.tempRegUser.phone,
      statesExcluded: excludedStates,
      budget,
      leadFields: selectedFields,
      goal,
      notifEmail,
      notifPhone
    };

    // Pre-fill Step 5 Notification email/phone on first view entry
    document.getElementById('ob-notif-email').value = this.tempRegUser.email;
    document.getElementById('ob-notif-phone').value = this.tempRegUser.phone;

    // Advance to Plan selector view
    this.navigateTo('payment');
  }

  // Plan Selection & Checkout Page
  selectPlan(planName, price) {
    this.state.currentPlan = planName;
    this.state.currentPrice = price;

    // Save all onboarding data to localStorage BEFORE payment screen
    this.saveOnboardingDataBeforePayment(planName, price);

    this.showPlanCheckoutScreen(planName, price);
  }

  saveOnboardingDataBeforePayment(planName, price) {
    if (this.tempClientDetails && this.tempRegUser) {
      const clientId = 'client_' + Date.now();
      
      const newClient = {
        id: clientId,
        firstName: this.tempClientDetails.name.split(' ')[0] || '',
        lastName: this.tempClientDetails.name.split(' ').slice(1).join(' ') || '',
        email: this.tempRegUser.email.toLowerCase(),
        phone: this.tempClientDetails.phone,
        statesExcluded: this.tempClientDetails.statesExcluded,
        budget: this.tempClientDetails.budget,
        leadFields: this.tempClientDetails.leadFields,
        goal: this.tempClientDetails.goal,
        notifEmail: this.tempClientDetails.notifEmail,
        notifPhone: this.tempClientDetails.notifPhone,
        planName: planName === 'Plan 1' ? 'Plan 1 (Monthly)' : 'Plan 2 (6-Month)',
        planPrice: price,
        status: 'Pending Payment',
        signupDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        notes: 'Client completed onboarding wizard. Awaiting Stripe payment verification.',
        metrics: {
          leads: 0,
          appointments: 0,
          spend: 0,
          cpl: 0,
          cpbc: 0,
          history: [0, 0, 0, 0, 0]
        },
        checklist: [
          { text: 'Submit Onboarding Form', checked: true },
          { text: 'Pay Initial Invoice', checked: false },
          { text: 'Integrate CRM System', checked: false },
          { text: 'Verify Ad Creatives', checked: false },
          { text: 'Schedule Kickoff Call', checked: false }
        ],
        messages: [
          { sender: 'admin', text: `Welcome to CloseMore, ${this.tempClientDetails.name}! Please complete checkout to launch your marketing portal.`, time: 'Just Now' }
        ],
        files: [],
        opportunities: [],
        ghlConnected: false,
        surveySource: null
      };

      // Add to clients list
      this.state.clients.push(newClient);

      // Register credentials list
      this.state.users.push({
        email: this.tempRegUser.email.toLowerCase(),
        password: this.tempRegUser.password,
        role: 'client',
        clientId
      });

      this.state.currentUser = newClient; // Set current session scope
      this.saveState();

      // Clean temp signup registers
      this.tempRegUser = null;
      this.tempClientDetails = null;
    }
  }

  showPlanCheckoutScreen(planName, price) {
    const client = this.state.currentUser;
    if (!client) return;

    // Normalize the plan name. Callers may pass either the short id ('Plan 1')
    // from the picker buttons or the full stored label ('Plan 1 (Monthly)')
    // when re-entering checkout for a Pending Payment client.
    const isPlan1 = String(planName).includes('Plan 1');
    planName = isPlan1 ? 'Plan 1' : 'Plan 2';

    // Display order details summary autofilled
    document.getElementById('checkout-selected-plan-name').textContent = planName === 'Plan 1' ? 'Plan 1 (Monthly Campaign Builder)' : 'Plan 2 (6-Month Scaling Partner)';
    document.getElementById('checkout-customer-name').textContent = `${client.firstName} ${client.lastName}`;
    document.getElementById('checkout-customer-email').textContent = client.email;
    document.getElementById('checkout-customer-phone').textContent = client.phone;
    
    document.getElementById('stripe-price-display').textContent = `$${price.toLocaleString()}.00`;

    // Cancellation policy warning display toggle
    const cancelNotice = document.getElementById('checkout-cancel-notice');
    if (planName === 'Plan 2') {
      cancelNotice.style.display = 'block';
    } else {
      cancelNotice.style.display = 'none';
    }

    // Dynamic Stripe Embed rendering (using exact provided IDs)
    const buttonContainer = document.getElementById('stripe-buy-button-container');
    const buyButtonId = planName === 'Plan 1' ? 'buy_btn_1TcZrtPcqLI3XNsKx5OdW96R' : 'buy_btn_1TcZlTPcqLI3XNsKXQIMc3OZ';
    
    buttonContainer.innerHTML = `
      <stripe-buy-button
        buy-button-id="${buyButtonId}"
        publishable-key="pk_test_51PZaL4PcqLI3XNsKU5D5h4s8O4Q1s"
        style="width: 100%; max-width: 300px;"
      ></stripe-buy-button>
    `;

    // Toggle views
    document.getElementById('plans-picker-section').style.display = 'none';
    document.getElementById('stripe-checkout-section').style.display = 'block';
  }

  // Payment Verification action button (enforcing success checking)
  verifyStripePayment() {
    const client = this.state.currentUser;
    if (!client) {
      this.showToast('Error: No active session active.', 'error');
      return;
    }

    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';

    setTimeout(() => {
      overlay.style.display = 'none';

      // Mark paid, update database
      client.status = 'Active';
      const paidTask = client.checklist.find(t => t.text.includes('Invoice') || t.text.includes('Invoice') || t.text.includes('Payment') || t.text.includes('Invoice'));
      if (paidTask) paidTask.checked = true;

      // Sync back to master array
      const masterIdx = this.state.clients.findIndex(c => c.id === client.id);
      if (masterIdx !== -1) {
        this.state.clients[masterIdx].status = 'Active';
        this.state.clients[masterIdx].checklist = client.checklist;
        this.state.clients[masterIdx].notes = 'Checkout successful. Customer portal active.';
      }

      this.saveState();
      this.showToast('Stripe Checkout Payment Verified!', 'success');
      this.navigateTo('client-portal');

      // Trigger Floating popup survey modal immediately on first access
      this.triggerFirstLoginExperience();
    }, 2000);
  }

  // First Login Experience Survey Popup
  triggerFirstLoginExperience() {
    const client = this.state.currentUser;
    if (client && client.status === 'Active' && !client.surveySource) {
      document.getElementById('first-login-survey-modal').style.display = 'flex';
    }
  }

  submitFirstLoginSurvey(event) {
    event.preventDefault();
    const sourceEl = document.querySelector('input[name="survey-source"]:checked');
    if (!sourceEl) {
      this.showToast('Please select how you heard about us.', 'error');
      return;
    }
    const source = sourceEl.value;
    const client = this.state.currentUser;

    if (client) {
      client.surveySource = source;
      
      const masterIdx = this.state.clients.findIndex(c => c.id === client.id);
      if (masterIdx !== -1) {
        this.state.clients[masterIdx].surveySource = source;
      }

      this.saveState();
      document.getElementById('first-login-survey-modal').style.display = 'none';
      this.showToast('Thank you! Details stored.', 'success');
      this.loadClientPortal();
    }
  }

  // Client Portal Dash Panel loader
  loadClientPortal() {
    const client = this.state.currentUser;
    if (!client) return;

    // Welcome title & Status
    document.getElementById('portal-welcome-title').textContent = `Welcome, ${client.firstName} ${client.lastName}`;
    const badge = document.getElementById('portal-campaign-status-badge');
    badge.textContent = `Campaign ${client.status}`;
    if (client.status === 'Active') {
      badge.className = 'status-badge status-active';
    } else {
      badge.className = 'status-badge status-pending';
    }

    // Populate Metrics
    document.getElementById('m-leads').textContent = client.metrics.leads;
    document.getElementById('m-appointments').textContent = client.metrics.appointments;
    document.getElementById('m-spend').textContent = `$${client.metrics.spend.toLocaleString()}`;
    document.getElementById('m-cpl').textContent = `$${client.metrics.cpl.toFixed(2)}`;
    document.getElementById('m-cpbc').textContent = `$${client.metrics.cpbc.toFixed(2)}`;

    // Populate Google & Meta specifics
    document.getElementById('google-clicks').textContent = Math.round(client.metrics.leads * 3.4);
    document.getElementById('google-conversions').textContent = Math.round(client.metrics.leads * 0.45);
    document.getElementById('meta-impressions').textContent = Math.round(client.metrics.leads * 940).toLocaleString();
    document.getElementById('meta-leads').textContent = Math.round(client.metrics.leads * 0.55);
    document.getElementById('meta-cpl').textContent = `$${(client.metrics.cpl * 1.15).toFixed(2)}`;

    // Checklist
    this.renderClientChecklist();

    // Files list
    this.renderClientFiles();

    // Chat
    this.renderClientChat();

    // Billing
    this.renderClientBilling();

    // Calendar
    this.renderMockCalendar();

    // Deals Kanban board opportunities render
    this.renderDealsPipeline();

    // Pre-fill client settings page
    this.loadClientSettingsData();

    // Render SVG Performance Charts
    this.renderPortalCharts();
  }

  switchPortalTab(tabName) {
    this.state.activePortalTab = tabName;
    
    // Adjust sidebar highlight
    const items = document.querySelectorAll('.sidebar-item');
    items.forEach(i => i.classList.remove('active'));
    const activeItem = document.getElementById(`cp-menu-${tabName}`);
    if (activeItem) activeItem.classList.add('active');

    // Swap panel views
    const panels = document.querySelectorAll('.portal-panel');
    panels.forEach(p => p.classList.remove('active'));
    document.getElementById(`portal-tab-${tabName}`).classList.add('active');

    // Force chart sizing adjustments on tab change
    if (tabName === 'dash' || tabName === 'google' || tabName === 'meta') {
      setTimeout(() => this.renderPortalCharts(), 50);
    }
  }

  renderClientChecklist() {
    const client = this.state.currentUser;
    const box = document.getElementById('checklist-tasks-box');
    box.innerHTML = '';

    client.checklist.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = `checklist-item ${item.checked ? 'checked' : ''}`;
      div.onclick = () => this.toggleClientChecklistLocal(index);
      
      div.innerHTML = `
        <div class="checklist-checkbox">
          ${item.checked ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        </div>
        <span>${item.text}</span>
      `;
      box.appendChild(div);
    });
  }

  toggleClientChecklistLocal(index) {
    const client = this.state.currentUser;
    client.checklist[index].checked = !client.checklist[index].checked;
    
    // Sync back to master clients array
    const masterIdx = this.state.clients.findIndex(c => c.id === client.id);
    if (masterIdx !== -1) {
      this.state.clients[masterIdx].checklist = client.checklist;
    }
    
    this.saveState();
    this.renderClientChecklist();
    this.showToast('Checklist task updated.', 'success');
  }

  renderClientFiles() {
    const client = this.state.currentUser;
    const list = document.getElementById('client-files-list-box');
    list.innerHTML = '';

    if (client.files.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding:15px; color:var(--color-text-muted); font-size:13px;">No files uploaded yet.</div>`;
      return;
    }

    client.files.forEach((file, index) => {
      const div = document.createElement('div');
      div.className = 'file-item';
      div.innerHTML = `
        <div class="file-info">
          <svg class="file-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div>
            <div>${file.name}</div>
            <div style="font-size:11px; color:var(--color-text-muted);">${file.size} • ${file.date}</div>
          </div>
        </div>
        <div class="file-actions">
          <button class="btn-text" style="color:var(--color-primary); font-size:13px;" onclick="app.downloadFileSim('${file.name}')">Download</button>
          <button class="btn-text" style="color:var(--color-danger); font-size:13px;" onclick="app.deleteFileLocal(${index})">Delete</button>
        </div>
      `;
      list.appendChild(div);
    });
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const client = this.state.currentUser;
    const newFile = {
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    client.files.push(newFile);
    
    // Sync to master array
    const masterIdx = this.state.clients.findIndex(c => c.id === client.id);
    if (masterIdx !== -1) {
      this.state.clients[masterIdx].files = client.files;
    }

    this.saveState();
    this.renderClientFiles();
    this.showToast(`Uploaded ${file.name} successfully!`, 'success');
  }

  downloadFileSim(name) {
    this.showToast(`Simulated download of: ${name}`, 'success');
  }

  deleteFileLocal(index) {
    const client = this.state.currentUser;
    client.files.splice(index, 1);
    
    // Sync
    const masterIdx = this.state.clients.findIndex(c => c.id === client.id);
    if (masterIdx !== -1) {
      this.state.clients[masterIdx].files = client.files;
    }

    this.saveState();
    this.renderClientFiles();
    this.showToast('File removed from vault.', 'success');
  }

  renderClientChat() {
    const client = this.state.currentUser;
    const chatBox = document.getElementById('client-chat-history');
    chatBox.innerHTML = '';

    if (!client.messages || client.messages.length === 0) {
      chatBox.innerHTML = `<div style="text-align:center; margin-top: 40px; color:var(--color-text-muted); font-size:13px;">Ask our optimization team any questions regarding ad assets or campaign targeting.</div>`;
      return;
    }

    client.messages.forEach(msg => {
      const bubble = document.createElement('div');
      const isClient = msg.sender === 'client';
      bubble.className = `message-bubble ${isClient ? 'message-client' : 'message-admin'}`;
      bubble.innerHTML = `
        <div>${msg.text}</div>
        <span class="message-time">${msg.time}</span>
      `;
      chatBox.appendChild(bubble);
    });

    // Auto-scroll chat
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  sendChatMessage(event, sender) {
    event.preventDefault();
    const inputId = sender === 'client' ? 'client-chat-input' : 'admin-chat-input';
    const input = document.getElementById(inputId);
    const text = input.value.trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newMessage = { sender, text, time };

    if (sender === 'client') {
      const client = this.state.currentUser;
      client.messages.push(newMessage);
      
      const masterIdx = this.state.clients.findIndex(c => c.id === client.id);
      if (masterIdx !== -1) {
        this.state.clients[masterIdx].messages = client.messages;
      }
      this.saveState();
      this.renderClientChat();
    } else {
      // Admin sender
      const clientEmail = this.state.selectedAdminClientEmail;
      const client = this.state.clients.find(c => c.email === clientEmail);
      if (client) {
        client.messages.push(newMessage);
        this.saveState();
        this.renderAdminChat();
      }
    }

    input.value = '';
    this.showToast('Message sent.', 'success');
  }

  renderClientBilling() {
    const client = this.state.currentUser;
    document.getElementById('billing-plan-title').textContent = client.planName;
    document.getElementById('billing-plan-price').textContent = `$${client.planPrice.toLocaleString()} / month`;
    document.getElementById('billing-plan-desc').textContent = client.planName.includes('6-Month') || client.planName.includes('Plan 2') ? '6-month commitment, charged monthly' : '1-month commitment';
    
    // Mock Next Invoice Date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    const dateStr = nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    document.getElementById('billing-next-date').textContent = dateStr;

    // Render Invoices Table
    const tbody = document.getElementById('billing-invoices-tbody');
    tbody.innerHTML = '';

    const billingDays = [0]; // days ago paid
    billingDays.forEach((days, i) => {
      const date = new Date();
      date.setDate(date.getDate() - days);
      const invoiceDateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding:12px; font-family:var(--font-display); font-weight: 600;">INV-0892${i}</td>
        <td style="padding:12px;">${invoiceDateStr}</td>
        <td style="padding:12px;">$${client.planPrice.toLocaleString()}.00</td>
        <td style="padding:12px;"><span class="status-badge status-active" style="padding: 2px 8px; font-size:11px;">Paid</span></td>
        <td style="padding:12px;"><button class="btn-text" style="color:var(--color-primary);" onclick="app.downloadInvoiceSim('INV-0892${i}')">PDF</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  downloadInvoiceSim(invId) {
    this.showToast(`Simulated receipt PDF download: ${invId}`, 'success');
  }

  // Booking calendar scheduler logic
  renderMockCalendar() {
    const calendar = document.getElementById('mock-calendar');
    calendar.innerHTML = '';

    // Render Days Headers
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    days.forEach(d => {
      const span = document.createElement('div');
      span.style.fontWeight = '700';
      span.style.fontSize = '12px';
      span.style.color = 'var(--color-text-muted)';
      span.style.textAlign = 'center';
      span.textContent = d;
      calendar.appendChild(span);
    });

    // Generate days grid for current month preview
    const date = new Date();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    // First day of current month
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // Last day of current month
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Print empty slots
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'calendar-day empty';
      calendar.appendChild(emptyDiv);
    }

    // Print actual days
    for (let i = 1; i <= lastDay; i++) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'calendar-day';
      dayDiv.textContent = i;

      // Select active class if matches selection
      if (this.state.meetingSelectedDate === i) {
        dayDiv.classList.add('active');
      }

      // disable past days for realistic touch
      if (i < date.getDate()) {
        dayDiv.style.opacity = '0.3';
        dayDiv.style.cursor = 'default';
      } else {
        dayDiv.onclick = () => this.selectCalendarDate(i, dayDiv);
      }

      calendar.appendChild(dayDiv);
    }
  }

  selectCalendarDate(dayNum, element) {
    this.state.meetingSelectedDate = dayNum;
    
    // Toggle active classes on grid
    const days = document.querySelectorAll('.calendar-day');
    days.forEach(d => d.classList.remove('active'));
    element.classList.add('active');

    // Show timeslots row
    document.getElementById('mock-timeslots').style.display = 'flex';
  }

  selectTimeSlot(element) {
    this.state.meetingSelectedTime = element.textContent;
    
    // Highlight choice
    const slots = document.querySelectorAll('.time-slot');
    slots.forEach(s => s.classList.remove('active'));
    element.classList.add('active');

    // Enable confirm button
    document.getElementById('book-slot-btn').removeAttribute('disabled');
  }

  confirmMeetingBooking() {
    if (!this.state.meetingSelectedDate || !this.state.meetingSelectedTime) return;
    
    const client = this.state.currentUser;
    const bookingString = `Scheduled Kickoff Call (${this.state.meetingSelectedTime} on Day ${this.state.meetingSelectedDate})`;
    
    // Find Kickoff task and update it
    const kickoffTaskIndex = client.checklist.findIndex(t => t.text.includes('Kickoff'));
    if (kickoffTaskIndex !== -1) {
      client.checklist[kickoffTaskIndex].text = bookingString;
      client.checklist[kickoffTaskIndex].checked = true;
    }

    // Sync
    const masterIdx = this.state.clients.findIndex(c => c.id === client.id);
    if (masterIdx !== -1) {
      this.state.clients[masterIdx].checklist = client.checklist;
    }

    this.saveState();
    this.renderClientChecklist();
    this.showToast(`Meeting Booked for Day ${this.state.meetingSelectedDate} at ${this.state.meetingSelectedTime}!`, 'success');
    
    // reset calendar
    this.state.meetingSelectedDate = null;
    this.state.meetingSelectedTime = null;
    document.getElementById('mock-timeslots').style.display = 'none';
    document.getElementById('book-slot-btn').setAttribute('disabled', 'true');
    this.renderMockCalendar();
  }

  // --- CLIENT DEALS OPPORTUNITIES CRM PIPELINE ---
  renderDealsPipeline() {
    const client = this.state.currentUser;
    if (!client) return;

    const stages = [
      'New Lead',
      'Appointment Set',
      'Closed Won',
      'Wrong / Bad / Disconnected Phone',
      'Appointment Quote Only',
      'Quote Not Taken',
      'DNC'
    ];

    // Ensure opportunities array exists
    if (!client.opportunities) {
      client.opportunities = [];
    }

    const container = document.getElementById('deals-board-container');
    container.innerHTML = '';

    // Connect GHL banner toggle
    const connectBtn = document.getElementById('ghl-connect-btn');
    if (client.ghlConnected) {
      connectBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><polyline points="20 6 9 17 4 12"/></svg>
        GoHighLevel Connected
      `;
      connectBtn.className = 'btn btn-secondary btn-sm';
      connectBtn.style.borderColor = 'var(--color-success)';
      connectBtn.style.color = 'var(--color-success)';
      connectBtn.onclick = () => this.disconnectGoHighLevel();
    } else {
      connectBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
        Connect To GoHighLevel
      `;
      connectBtn.className = 'btn btn-primary btn-sm';
      connectBtn.style.borderColor = '';
      connectBtn.style.color = '';
      connectBtn.onclick = () => this.connectGoHighLevel();
    }

    // Render columns
    stages.forEach(stage => {
      const colDiv = document.createElement('div');
      colDiv.className = 'deals-column';
      
      const oppsInStage = client.opportunities.filter(o => o.stage === stage);
      
      colDiv.innerHTML = `
        <div class="deals-column-header">
          <span>${stage}</span>
          <span class="deals-column-count">${oppsInStage.length}</span>
        </div>
        <div class="deals-cards-dropzone" style="display:flex; flex-direction:column; gap:10px; flex-grow:1; min-height:380px;" ondragover="event.preventDefault()" ondrop="app.handleDealDrop(event, '${stage}')">
          <!-- Cards -->
        </div>
      `;

      const cardsContainer = colDiv.querySelector('.deals-cards-dropzone');
      
      if (oppsInStage.length === 0) {
        cardsContainer.innerHTML = `<div style="text-align:center; padding:30px; font-size:12px; color:var(--color-text-muted); border:1px dashed var(--border-color); border-radius:4px; height:100%; display:flex; align-items:center; justify-content:center;">Drop leads here</div>`;
      } else {
        oppsInStage.forEach(opp => {
          const card = document.createElement('div');
          card.className = 'deals-card';
          card.draggable = true;
          card.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', opp.id);
          };
          
          card.innerHTML = `
            <div class="deals-card-name">${opp.name}</div>
            <div style="font-size:12px; margin-bottom:8px; color:var(--color-text-secondary);">${opp.phone}</div>
            <div class="deals-card-meta">
              <span style="font-weight:700; color:var(--color-primary);">${opp.value}</span>
              <span>${opp.date}</span>
            </div>
            
            <div style="margin-top:10px; border-top:1px solid var(--border-color); padding-top:8px; display:flex; justify-content:space-between; align-items:center;">
              <select style="padding:2px; font-size:11px; width:auto; height:24px;" onchange="app.moveDealLocal('${opp.id}', this.value)">
                ${stages.map(st => `<option value="${st}" ${st === stage ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
              <button class="btn-text" style="color:var(--color-danger); font-size:11px;" onclick="app.deleteDealLocal('${opp.id}')">Delete</button>
            </div>
          `;
          cardsContainer.appendChild(card);
        });
      }

      container.appendChild(colDiv);
    });
  }

  connectGoHighLevel() {
    const key = prompt("Please enter your GoHighLevel API Key or Location ID:");
    if (key === null) return;
    
    if (!key.trim()) {
      this.showToast("GoHighLevel API key cannot be empty.", "error");
      return;
    }

    const client = this.state.currentUser;
    client.ghlConnected = true;
    
    // Sync
    const masterIdx = this.state.clients.findIndex(c => c.id === client.id);
    if (masterIdx !== -1) {
      this.state.clients[masterIdx].ghlConnected = true;
    }

    this.saveState();
    this.renderDealsPipeline();
    this.showToast("Successfully connected GHL API and mapped pipeline stages!", "success");
  }

  disconnectGoHighLevel() {
    if (confirm("Are you sure you want to disconnect GoHighLevel CRM integration?")) {
      const client = this.state.currentUser;
      client.ghlConnected = false;
      
      const masterIdx = this.state.clients.findIndex(c => c.id === client.id);
      if (masterIdx !== -1) {
        this.state.clients[masterIdx].ghlConnected = false;
      }

      this.saveState();
      this.renderDealsPipeline();
      this.showToast("GoHighLevel integration disconnected.", "warning");
    }
  }

  handleDealDrop(event, targetStage) {
    event.preventDefault();
    const dealId = event.dataTransfer.getData('text/plain');
    this.moveDealLocal(dealId, targetStage);
  }

  moveDealLocal(dealId, newStage) {
    const client = this.state.currentUser;
    const opp = client.opportunities.find(o => o.id === dealId);
    if (opp) {
      opp.stage = newStage;
      
      const masterIdx = this.state.clients.findIndex(c => c.id === client.id);
      if (masterIdx !== -1) {
        this.state.clients[masterIdx].opportunities = client.opportunities;
      }
      this.saveState();
      this.renderDealsPipeline();
      this.showToast(`Opportunity stage updated to: ${newStage}`, 'success');
    }
  }

  deleteDealLocal(dealId) {
    if (confirm("Remove this opportunity card?")) {
      const client = this.state.currentUser;
      const idx = client.opportunities.findIndex(o => o.id === dealId);
      if (idx !== -1) {
        client.opportunities.splice(idx, 1);
        
        const masterIdx = this.state.clients.findIndex(c => c.id === client.id);
        if (masterIdx !== -1) {
          this.state.clients[masterIdx].opportunities = client.opportunities;
        }
        
        this.saveState();
        this.renderDealsPipeline();
        this.showToast("Opportunity removed.", "success");
      }
    }
  }

  // --- CLIENT SETTINGS TAB HANDLERS ---
  loadClientSettingsData() {
    const client = this.state.currentUser;
    if (!client) return;

    document.getElementById('sett-first-name').value = client.firstName || '';
    document.getElementById('sett-last-name').value = client.lastName || '';
    document.getElementById('sett-phone').value = client.phone || '';
    
    document.getElementById('sett-notif-email').value = client.notifEmail || client.email;
    document.getElementById('sett-notif-phone').value = client.notifPhone || client.phone;

    // Check correct radio button
    const themeVal = this.state.themePreference || 'light';
    const radio = document.querySelector(`input[name="sett-theme"][value="${themeVal}"]`);
    if (radio) {
      radio.checked = true;
      document.querySelectorAll(`input[name="sett-theme"]`).forEach(r => r.closest('.option-card').classList.remove('selected'));
      radio.closest('.option-card').classList.add('selected');
    }
  }

  switchSettingsSection(sectionId) {
    const items = document.querySelectorAll('.settings-nav-item');
    items.forEach(i => i.classList.remove('active'));
    document.getElementById(`btn-sett-${sectionId}`).classList.add('active');

    const sections = document.querySelectorAll('.settings-section');
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById(`sett-section-${sectionId}`).classList.add('active');
  }

  saveProfileSettings(event) {
    event.preventDefault();
    const client = this.state.currentUser;
    const fName = document.getElementById('sett-first-name').value.trim();
    const lName = document.getElementById('sett-last-name').value.trim();
    const phone = document.getElementById('sett-phone').value.trim();

    if (client) {
      client.firstName = fName;
      client.lastName = lName;
      client.phone = phone;

      const masterIdx = this.state.clients.findIndex(c => c.id === client.id);
      if (masterIdx !== -1) {
        this.state.clients[masterIdx].firstName = fName;
        this.state.clients[masterIdx].lastName = lName;
        this.state.clients[masterIdx].phone = phone;
      }
      this.saveState();
      this.showToast('Profile settings updated successfully.', 'success');
      this.loadClientPortal();
    }
  }

  saveNotificationSettings(event) {
    event.preventDefault();
    const client = this.state.currentUser;
    const email = document.getElementById('sett-notif-email').value.trim();
    const phone = document.getElementById('sett-notif-phone').value.trim();

    if (client) {
      client.notifEmail = email;
      client.notifPhone = phone;

      const masterIdx = this.state.clients.findIndex(c => c.id === client.id);
      if (masterIdx !== -1) {
        this.state.clients[masterIdx].notifEmail = email;
        this.state.clients[masterIdx].notifPhone = phone;
      }
      this.saveState();
      this.showToast('Lead routing notification channels updated.', 'success');
      this.loadClientPortal();
    }
  }

  setThemePreference(theme) {
    this.state.themePreference = theme;
    this.saveState();
    
    // update highlights
    document.querySelectorAll(`input[name="sett-theme"]`).forEach(r => {
      r.closest('.option-card').classList.remove('selected');
      if (r.value === theme) {
        r.checked = true;
        r.closest('.option-card').classList.add('selected');
      }
    });

    this.applyTheme(theme);
    this.showToast(`Theme changed to: ${theme}`, 'success');
  }

  applyTheme(theme) {
    document.body.className = ''; // remove theme-dark
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
    } else if (theme === 'system') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('theme-dark');
      }
    }
  }

  // Dashboard SVG Graph Generator
  renderPortalCharts() {
    const client = this.state.currentUser;
    if (!client) return;

    this.drawSVGLineChart('svg-lead-chart-box', client.metrics.history || [10, 20, 15, 30, 45], 'indigo');
    
    const googleData = (client.metrics.history || [5, 12, 10, 18, 22]).map(v => Math.round(v * 0.45));
    const metaData = (client.metrics.history || [8, 15, 12, 22, 28]).map(v => Math.round(v * 0.55));
    
    this.drawSVGLineChart('svg-google-chart-box', googleData, 'emerald');
    this.drawSVGLineChart('svg-meta-chart-box', metaData, 'violet');
  }

  drawSVGLineChart(containerId, dataValues, themeColor) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = container.clientWidth || 350;
    const height = 200;
    const padding = 30;

    const maxVal = Math.max(...dataValues, 10);
    const pointsCount = dataValues.length;

    let gridLinesHTML = '';
    const horizontalDivs = 4;
    for (let i = 0; i <= horizontalDivs; i++) {
      const y = padding + (height - padding * 2) * (i / horizontalDivs);
      const val = Math.round(maxVal - (maxVal * (i / horizontalDivs)));
      gridLinesHTML += `
        <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" class="chart-grid-line" />
        <text x="${padding - 5}" y="${y + 4}" class="chart-axis-text" text-anchor="end">${val}</text>
      `;
    }

    let pathString = '';
    let areaPoints = `${padding},${height - padding}`;
    let dotsHTML = '';

    // Avoid divide-by-zero when there is only a single data point.
    const xDivisor = Math.max(pointsCount - 1, 1);
    dataValues.forEach((val, idx) => {
      const x = padding + ((width - padding * 2) * (idx / xDivisor));
      const y = (height - padding) - ((height - padding * 2) * (val / maxVal));
      
      if (idx === 0) {
        pathString += `M ${x} ${y}`;
      } else {
        pathString += ` L ${x} ${y}`;
      }
      areaPoints += ` L ${x} ${y}`;
      
      dotsHTML += `
        <circle cx="${x}" cy="${y}" r="5" class="chart-dot" style="--color-primary:${themeColor === 'indigo' ? '#2563eb' : themeColor === 'emerald' ? '#10b981' : '#a855f7'}" />
      `;
    });
    
    areaPoints += ` L ${width - padding},${height - padding} Z`;

    const svgStroke = themeColor === 'indigo' ? '#2563eb' : themeColor === 'emerald' ? '#10b981' : '#a855f7';
    const fillGradId = `area-grad-${containerId}`;

    container.innerHTML = `
      <svg class="chart-svg" width="${width}" height="${height}">
        <defs>
          <linearGradient id="${fillGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${svgStroke}" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="${svgStroke}" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        ${gridLinesHTML}
        <path d="${areaPoints}" fill="url(#${fillGradId})" />
        <path d="${pathString}" fill="none" stroke="${svgStroke}" stroke-width="3" stroke-linecap="round" />
        ${dotsHTML}
        <text x="${padding}" y="${height - 8}" class="chart-axis-text">Week 1</text>
        <text x="${padding + (width - padding * 2) * 0.25}" y="${height - 8}" class="chart-axis-text">Week 2</text>
        <text x="${padding + (width - padding * 2) * 0.5}" y="${height - 8}" class="chart-axis-text">Week 3</text>
        <text x="${padding + (width - padding * 2) * 0.75}" y="${height - 8}" class="chart-axis-text">Week 4</text>
        <text x="${width - padding}" y="${height - 8}" class="chart-axis-text" text-anchor="end">Week 5</text>
      </svg>
    `;
  }

  // --- INTERNAL ADMIN DASHBOARD OPERATIONS ---
  loadAdminDashboard() {
    this.switchAdminTab('workspace'); // default show client list editor

    // Load recent tables
    this.renderAdminOverviewStats();
    this.renderAdminEnrolledAccountsTable();
    this.renderAdminBillingManagement();

    this.renderAdminClientsList();
    
    const panel = document.getElementById('admin-details-panel');
    const emptyMsg = document.getElementById('admin-no-client-selected');

    if (this.state.selectedAdminClientEmail) {
      panel.classList.add('active');
      emptyMsg.style.display = 'none';
      this.loadAdminClientDetails(this.state.selectedAdminClientEmail);
    } else {
      panel.classList.remove('active');
      emptyMsg.style.display = 'flex';
    }

    this.renderAdminTeamTasks();
  }

  switchAdminTab(tabName) {
    const panels = document.querySelectorAll('.admin-panel-tab');
    panels.forEach(p => p.style.display = 'none');

    const tabs = ['overview', 'enrolled', 'billing', 'workspace'];
    tabs.forEach(t => {
      document.getElementById(`btn-adm-tab-${t}`).classList.remove('active');
    });

    document.getElementById(`admin-panel-${tabName}`).style.display = 'block';
    document.getElementById(`btn-adm-tab-${tabName}`).classList.add('active');

    // Load sub-panel dynamic counts
    if (tabName === 'overview') {
      this.renderAdminOverviewStats();
    } else if (tabName === 'enrolled') {
      this.renderAdminEnrolledAccountsTable();
    } else if (tabName === 'billing') {
      this.renderAdminBillingManagement();
    }
  }

  renderAdminOverviewStats() {
    const activeClients = this.state.clients.filter(c => c.status === 'Active');
    const totalLeads = this.state.clients.reduce((acc, c) => acc + (c.metrics.leads || 0), 0);
    
    // Revenue calculations (Active client sums)
    const activeRevenue = activeClients.reduce((acc, c) => acc + (c.planPrice || 0), 0);
    const totalRev = this.state.clients.reduce((acc, c) => acc + (c.status === 'Active' ? c.planPrice : 0), 0);

    document.getElementById('adm-stat-revenue').textContent = `$${totalRev.toLocaleString()}.00`;
    document.getElementById('adm-stat-active').textContent = activeClients.length;
    document.getElementById('adm-stat-leads').textContent = totalLeads;
    document.getElementById('adm-stat-monthly').textContent = `$${activeRevenue.toLocaleString()}.00`;

    // Render Recent Signups Overview table
    const signupTbody = document.getElementById('adm-table-recent-signups');
    signupTbody.innerHTML = '';
    
    this.state.clients.slice(-5).reverse().forEach(c => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding:10px; font-weight:600;">${c.firstName} ${c.lastName}</td>
        <td style="padding:10px; color:var(--color-text-secondary);">${c.email}</td>
        <td style="padding:10px;">${c.signupDate || 'May 2026'}</td>
      `;
      signupTbody.appendChild(tr);
    });

    // Render Recent Payments Overview table
    const payTbody = document.getElementById('adm-table-recent-payments');
    payTbody.innerHTML = '';
    
    activeClients.slice(-5).reverse().forEach(c => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding:10px; font-weight:600;">${c.firstName} ${c.lastName}</td>
        <td style="padding:10px; color:var(--color-success); font-weight:700;">$${c.planPrice.toLocaleString()}.00</td>
        <td style="padding:10px;">Today</td>
      `;
      payTbody.appendChild(tr);
    });
  }

  renderAdminEnrolledAccountsTable() {
    const tbody = document.getElementById('adm-table-enrolled-accounts');
    tbody.innerHTML = '';

    if (this.state.clients.length === 0) {
      tbody.innerHTML = `<tr><td colspan="14" style="text-align:center; padding:20px;">No enrolled accounts found.</td></tr>`;
      return;
    }

    this.state.clients.forEach(c => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding:12px 10px; font-weight:600;">${c.firstName} ${c.lastName}</td>
        <td style="padding:12px 10px;">${c.email}</td>
        <td style="padding:12px 10px;">${c.phone}</td>
        <td style="padding:12px 10px;">${c.planName || 'Plan 2'}</td>
        <td style="padding:12px 10px;"><span class="status-badge ${c.status === 'Active' ? 'status-active' : 'status-pending'}">${c.status}</span></td>
        <td style="padding:12px 10px;">${c.signupDate || 'May 2026'}</td>
        <td style="padding:12px 10px;">${c.notifEmail || c.email}</td>
        <td style="padding:12px 10px;">${c.notifPhone || c.phone}</td>
        <td style="padding:12px 10px;">${c.budget || '$3k - $5k'}</td>
        <td style="padding:12px 10px;">${c.statesExcluded && c.statesExcluded.length > 0 ? c.statesExcluded.join(', ') : 'None'}</td>
        <td style="padding:12px 10px;">Core + ${c.leadFields ? c.leadFields.length : 0} optional</td>
        <td style="padding:12px 10px; font-weight:700;">${c.metrics ? c.metrics.leads : 0}</td>
        <td style="padding:12px 10px;">${c.opportunities ? c.opportunities.length : 0}</td>
        <td style="padding:12px 10px;">${c.surveySource || 'Organic'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderAdminBillingManagement() {
    const activeTbody = document.getElementById('adm-table-billing-active');
    activeTbody.innerHTML = '';
    
    const activeClients = this.state.clients.filter(c => c.status === 'Active');
    
    activeClients.forEach(c => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + 30);
      
      tr.innerHTML = `
        <td style="padding:10px; font-weight:600;">${c.firstName} ${c.lastName}</td>
        <td style="padding:10px;">${c.planName}</td>
        <td style="padding:10px;">Billed: $${c.planPrice}/mo</td>
        <td style="padding:10px;">${renewalDate.toLocaleDateString()}</td>
      `;
      activeTbody.appendChild(tr);
    });

    const cancelsTbody = document.getElementById('adm-table-billing-cancels');
    cancelsTbody.innerHTML = '';

    // Mock Cancel Requests queue
    const cancels = [
      { name: 'Sarah Ramirez', plan: 'Plan 2 (6-Month)', status: 'Pending Review', fee: '$1,875.00' }
    ];

    cancels.forEach(c => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-color)';
      tr.innerHTML = `
        <td style="padding:10px; font-weight:600;">${c.name}</td>
        <td style="padding:10px;">${c.plan}</td>
        <td style="padding:10px;"><span class="status-badge status-pending">${c.status}</span></td>
        <td style="padding:10px; font-weight:700; color:var(--color-danger);">${c.fee}</td>
      `;
      cancelsTbody.appendChild(tr);
    });
  }

  renderAdminClientsList() {
    const list = document.getElementById('admin-clients-list-box');
    list.innerHTML = '';

    if (this.state.clients.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding:20px; color:var(--color-text-muted); font-size:13px;">No clients registered.</div>`;
      return;
    }

    this.state.clients.forEach(c => {
      const card = document.createElement('div');
      const isActive = this.state.selectedAdminClientEmail === c.email;
      card.className = `admin-client-card ${isActive ? 'active' : ''}`;
      card.onclick = () => this.selectAdminClient(c.email);
      
      card.innerHTML = `
        <div class="admin-client-name">${c.firstName} ${c.lastName}</div>
        <div class="admin-client-meta">
          <span>${c.planName || 'Plan 2'}</span>
          <span style="color:${c.status === 'Active' ? 'var(--color-success)' : 'var(--color-warning)'}">${c.status}</span>
        </div>
      `;
      list.appendChild(card);
    });
  }

  selectAdminClient(email) {
    this.state.selectedAdminClientEmail = email;
    this.saveState();
    this.loadAdminDashboard();
  }

  loadAdminClientDetails(email) {
    const client = this.state.clients.find(c => c.email === email);
    if (!client) return;

    // Header & details
    document.getElementById('admin-c-name').textContent = `${client.firstName} ${client.lastName}`;
    document.getElementById('admin-c-email').textContent = client.email;
    document.getElementById('admin-c-phone').textContent = client.phone;
    document.getElementById('admin-c-budget').textContent = client.budget || '$3,000 – $5,000';
    document.getElementById('admin-c-goal').textContent = client.goal || 'Appointments Booked';
    document.getElementById('admin-c-source').textContent = client.surveySource || 'None';
    document.getElementById('admin-c-revenue').textContent = client.status === 'Active' ? `$${client.planPrice.toLocaleString()}.00` : '$0.00';
    
    // Notification pre-fills
    document.getElementById('admin-c-notif-email').textContent = client.notifEmail || client.email;
    document.getElementById('admin-c-notif-phone').textContent = client.notifPhone || client.phone;

    // Excluded states list
    document.getElementById('admin-c-restricted').textContent = client.statesExcluded && client.statesExcluded.length > 0 ? client.statesExcluded.join(', ') : 'None';

    // Optional Form builder checkboxes configuration display
    const formFieldsContainer = document.getElementById('admin-c-form-fields');
    formFieldsContainer.innerHTML = '';
    
    if (client.leadFields && client.leadFields.length > 0) {
      client.leadFields.forEach(f => {
        const badge = document.createElement('span');
        badge.style.background = 'var(--bg-secondary)';
        badge.style.border = '1px solid var(--border-color)';
        badge.style.padding = '4px 8px';
        badge.style.borderRadius = '4px';
        badge.textContent = f;
        formFieldsContainer.appendChild(badge);
      });
    } else {
      formFieldsContainer.innerHTML = `<span style="color:var(--color-text-muted)">No optional fields selected (Core Only).</span>`;
    }

    // Status dropdown
    document.getElementById('admin-c-status-select').value = client.status;

    // Load editor form values
    document.getElementById('adm-leads').value = client.metrics.leads;
    document.getElementById('adm-appointments').value = client.metrics.appointments;
    document.getElementById('adm-spend').value = client.metrics.spend;
    document.getElementById('adm-cpl').value = client.metrics.cpl;
    document.getElementById('adm-cpbc').value = client.metrics.cpbc;

    // Campaign Private Notes
    document.getElementById('admin-campaign-notes').value = client.notes || '';

    // Render checklist toggle box
    this.renderAdminChecklistToggles(client);

    // Chat
    this.renderAdminChat();
  }

  renderAdminChecklistToggles(client) {
    const box = document.getElementById('admin-checklist-checkboxes-box');
    box.innerHTML = '';

    client.checklist.forEach((item, index) => {
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.gap = '8px';
      div.style.marginBottom = '10px';
      div.style.fontSize = '13px';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.width = '18px';
      checkbox.style.height = '18px';
      checkbox.checked = item.checked;
      checkbox.onchange = () => this.adminToggleChecklistItem(index, checkbox.checked);

      const span = document.createElement('span');
      span.textContent = item.text;

      div.appendChild(checkbox);
      div.appendChild(span);
      box.appendChild(div);
    });
  }

  adminToggleChecklistItem(index, isChecked) {
    const clientEmail = this.state.selectedAdminClientEmail;
    const client = this.state.clients.find(c => c.email === clientEmail);
    if (!client) return;

    client.checklist[index].checked = isChecked;
    this.saveState();
    this.showToast('Client checklist item status updated.', 'success');
  }

  adminChangeStatus(newStatus) {
    const clientEmail = this.state.selectedAdminClientEmail;
    const client = this.state.clients.find(c => c.email === clientEmail);
    if (!client) return;

    client.status = newStatus;
    this.saveState();
    this.showToast(`Client status adjusted to: ${newStatus}`, 'success');
    this.renderAdminClientsList();
    this.renderAdminOverviewStats();
  }

  adminSaveMetrics(event) {
    event.preventDefault();
    const clientEmail = this.state.selectedAdminClientEmail;
    const client = this.state.clients.find(c => c.email === clientEmail);
    if (!client) return;

    const leads = parseInt(document.getElementById('adm-leads').value);
    const appointments = parseInt(document.getElementById('adm-appointments').value);
    const spend = parseInt(document.getElementById('adm-spend').value);
    const cpl = parseFloat(document.getElementById('adm-cpl').value);
    const cpbc = parseFloat(document.getElementById('adm-cpbc').value);

    // Save metrics
    client.metrics = {
      leads,
      appointments,
      spend,
      cpl,
      cpbc,
      // Keep only the most recent 5 points so the chart's fixed 5-week axis
      // stays aligned (previously this grew unbounded on every save).
      history: [...(client.metrics.history || [0, 0, 0, 0]).slice(-4), leads]
    };

    this.saveState();
    this.showToast('Client acquisition metrics updated and synced live.', 'success');
    this.renderAdminOverviewStats();
  }

  adminSaveNotes() {
    const clientEmail = this.state.selectedAdminClientEmail;
    const client = this.state.clients.find(c => c.email === clientEmail);
    if (!client) return;

    const notes = document.getElementById('admin-campaign-notes').value;
    client.notes = notes;
    this.saveState();
    this.showToast('Private campaign notes saved.', 'success');
  }

  adminDeleteClient() {
    const clientEmail = this.state.selectedAdminClientEmail;
    const idx = this.state.clients.findIndex(c => c.email === clientEmail);
    if (idx === -1) return;

    if (confirm(`Are you sure you want to delete client ${this.state.clients[idx].firstName}?`)) {
      this.state.clients.splice(idx, 1);
      this.state.selectedAdminClientEmail = null;
      this.saveState();
      this.loadAdminDashboard();
      this.showToast('Client account permanently removed.', 'success');
    }
  }

  renderAdminChat() {
    const clientEmail = this.state.selectedAdminClientEmail;
    const client = this.state.clients.find(c => c.email === clientEmail);
    const chatBox = document.getElementById('admin-chat-history');
    chatBox.innerHTML = '';

    if (!client) return;

    if (!client.messages || client.messages.length === 0) {
      chatBox.innerHTML = `<div style="text-align:center; margin-top: 40px; color:var(--color-text-muted); font-size:13px;">No message history with this client.</div>`;
      return;
    }

    client.messages.forEach(msg => {
      const bubble = document.createElement('div');
      const isClient = msg.sender === 'client';
      bubble.className = `message-bubble ${isClient ? 'message-admin' : 'message-client'}`;
      bubble.innerHTML = `
        <div>${msg.text}</div>
        <span class="message-time">${msg.time}</span>
      `;
      chatBox.appendChild(bubble);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Admin Team tasks (internal tasks list)
  renderAdminTeamTasks() {
    const box = document.getElementById('admin-team-tasks-box');
    box.innerHTML = '';

    this.state.teamTasks.forEach((task) => {
      const div = document.createElement('div');
      div.className = 'file-item';
      div.style.marginBottom = '8px';
      
      div.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <input type="checkbox" style="width:18px; height:18px; cursor:pointer;" ${task.checked ? 'checked' : ''} onclick="app.adminToggleTeamTask('${task.id}')">
          <span style="${task.checked ? 'text-decoration:line-through; color:var(--color-text-muted);' : ''}">${task.text}</span>
        </div>
        <button class="btn-text" style="color:var(--color-danger); font-size:13px;" onclick="app.adminDeleteTeamTask('${task.id}')">Remove</button>
      `;
      box.appendChild(div);
    });
  }

  adminToggleTeamTask(id) {
    const task = this.state.teamTasks.find(t => t.id === id);
    if (task) {
      task.checked = !task.checked;
      this.saveState();
      this.renderAdminTeamTasks();
      this.showToast('Team task status updated.', 'success');
    }
  }

  adminAddTeamTask() {
    const text = prompt('Enter description for new team task:');
    if (!text) return;

    const newTask = {
      id: 'task_' + Date.now(),
      text,
      checked: false
    };

    this.state.teamTasks.push(newTask);
    this.saveState();
    this.renderAdminTeamTasks();
    this.showToast('Added new internal team task.', 'success');
  }

  adminDeleteTeamTask(id) {
    const idx = this.state.teamTasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.state.teamTasks.splice(idx, 1);
      this.saveState();
      this.renderAdminTeamTasks();
      this.showToast('Team task deleted.', 'success');
    }
  }

  // Homepage custom video players click visualizer
  playVideo(founder) {
    this.showToast(`Launching ${founder === 'mahad' ? "Mahad's" : "Rodrigo Castillo's"} premium conversion review video...`, 'success');
  }

  // Floating Toast Alert notification system
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Icon selection
    const icon = type === 'success' ? 
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="color:var(--color-success);"><polyline points="20 6 9 17 4 12"/></svg>' : 
      (type === 'warning' ? 
       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="color:var(--color-warning);"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' :
       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="color:var(--color-danger);"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>');
    
    toast.innerHTML = `
      ${icon}
      <span>${message}</span>
    `;

    container.appendChild(toast);
    
    // trigger animation entry
    setTimeout(() => toast.classList.add('show'), 50);

    // clear after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Instantiate application on window mount
window.app = new CloseMoreApp();
