// Single-page portfolio interactions
// Includes: theme toggle, reveal effects, and upgraded AI assistant motion.

(function () {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const backToTopButton = document.querySelector('.back-to-top');

    const updateBackToTopVisibility = () => {
        if (!backToTopButton) {
            return;
        }

        const shouldShow = window.scrollY > 160;
        backToTopButton.classList.toggle('is-visible', shouldShow);
    };

    updateBackToTopVisibility();
    window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
    backToTopButton?.addEventListener('click', () => {
        requestAnimationFrame(updateBackToTopVisibility);
    });

    const applyTheme = (theme) => {
        const isLight = theme === 'light';
        body.classList.toggle('light', isLight);

        const icon = themeToggle?.querySelector('i');
        if (!icon) {
            return;
        }

        if (isLight) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    };

    // Time-based theme: light from 6:00 to 17:59, dark otherwise
    const getTimeBasedTheme = () => {
        const hour = new Date().getHours();
        return hour >= 6 && hour < 18 ? 'light' : 'dark';
    };

    applyTheme(getTimeBasedTheme());

    themeToggle?.addEventListener('click', () => {
        const nextTheme = body.classList.contains('light') ? 'dark' : 'light';
        applyTheme(nextTheme);

        themeToggle.animate(
            [
                { transform: 'rotate(0deg) scale(1)' },
                { transform: 'rotate(180deg) scale(1.08)' },
                { transform: 'rotate(360deg) scale(1)' }
            ],
            { duration: 420, easing: 'ease-out' }
        );
    });

    // Reveal sections on viewport entry
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach((element) => revealObserver.observe(element));

    // Smart AI Portfolio Assistant (local recruiter-focused responses)
    const assistantToggle = document.getElementById('assistant-toggle');
    const assistantPanel = document.getElementById('assistant-panel');
    const assistantClose = document.getElementById('assistant-close');
    const assistantForm = document.getElementById('assistant-form');
    const assistantText = document.getElementById('assistant-text');
    const assistantMessages = document.getElementById('assistant-messages');

    const knowledgeBase = {
        owner: 'John Mirvin Riñon Sarte',
        name: 'John Mirvin Riñon Sarte',
        title: 'Information Systems Graduate | Full-Stack Developer | Systems Analyst',
        location: 'Albay, Philippines',
        summary: 'Cum Laude BS Information Systems graduate from Bicol University specializing in full-stack web development, systems analysis, and data-driven solutions focused on operational efficiency, data accuracy, and usability.',
        education: 'BS Information Systems (Cum Laude), Bicol University, Legazpi City, Albay, Class of 2025. Relevant coursework: Systems Analysis, Web Systems and Technology, Information Management, Enterprise Architecture. High School: Polangui General Comprehensive High School, STE and TVL Computer Programming (Java).',
        experience: 'Information Systems Intern at Social Security System – Legazpi Branch (Feb 2025 – May 2025): supported 800–1000 members, resolved 10–25 inquiries daily, improved service efficiency by ~30%, designed an SSS dashboard prototype (Figma/HTML/CSS/JS), and helped reduce manual transaction errors by 20%.',
        project: 'Major Project: Polangui Rural Health Unit Inventory and Patient Records Management System (Feb 2024 – Dec 2024), where John served as Research Group Leader and Full-Stack Developer. Features include role-based access control, admin/doctor portals, TOTP-based 2FA, SQL injection prevention via prepared statements, pharmaceutical inventory tracking, and analytics dashboards.',
        projectImpact: 'Project impact: improved administrative efficiency by 30% and increased data accuracy by 50%.',
        certifications: 'Oracle Cloud Infrastructure 2025 – OCI DevOps & Generative AI Professional. Focus areas: cloud infrastructure, DevOps practices, AI integration, and cloud automation.',
        achievements: 'Top 8 Cum Laude Graduate (BSIS Class of 2025), Dean’s Lister for 4 consecutive academic years (2021–2025), and Civil Service Commission Honor Graduate Eligibility.',
        technicalSkills: {
            languages: 'PHP, Java, JavaScript (ES6+), HTML5, CSS3',
            frameworks: 'React, Bootstrap, Vue.js, Laravel',
            databases: 'MySQL, MongoDB',
            tools: 'Git, GitHub, Figma, Agile/SCRUM',
            platforms: 'Google Workspace, Microsoft Office, ERP/MIS Systems, N8N workflow automation',
            specializations: 'DevOps, Generative AI, Data Reporting, API Integration, Systems Analysis'
        },
        softSkills: 'Analytical thinking, problem solving, stakeholder communication, collaboration, leadership, technical documentation, and project coordination.',
        spokenLanguages: 'English (Proficient), Tagalog (Native), Bikol (Native).',
        interests: 'Target roles: Software Engineer, Full-Stack Developer, Systems Analyst, IT Business Analyst, and Technical Consultant. Key interests: enterprise systems, healthcare information systems, government digital transformation, DevOps, and generative AI applications.',
        contact: 'Email: johnmirvin680@gmail.com | LinkedIn: https://www.linkedin.com/in/john-mirvin-sarte-47979121a/ | Location: Albay, Philippines'
    };

    const getProtectedChatEndpoint = () => {
        if (typeof window === 'undefined') {
            return '';
        }

        return window.MIRVIN_CHAT_CONFIG?.chatApiUrl || '/api/portfolio-chat';
    };

    const normalizeText = (text) => text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const hasAnyPhrase = (text, phrases) => phrases.some((phrase) => text.includes(phrase));
    const hasAllPhrases = (text, phrases) => phrases.every((phrase) => text.includes(phrase));
    const refersToMirvin = (text) => hasAnyPhrase(text, ['john', 'mirvin', 'sarte', 'you', 'your', 'yours']);

    // Conversation history for context
    let conversationHistory = [];
    
    const getProtectedAssistantReply = async (userQuestion) => {
        const endpoint = getProtectedChatEndpoint();
        if (!endpoint) {
            return null;
        }

        // Add user question to history
        conversationHistory.push({ role: 'user', message: userQuestion });
        
        // Keep only last 5 exchanges for context (to avoid token bloat)
        if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(-10);
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userQuestion,
                history: conversationHistory.slice(0, -1) // Send history without the current message
            })
        });

        if (!response.ok) {
            throw new Error(`Protected chat request failed with status ${response.status}`);
        }

        const data = await response.json();
        const reply = data.reply?.trim() || null;
        
        // Add assistant reply to history
        if (reply) {
            conversationHistory.push({ role: 'assistant', message: reply });
        }
        
        return reply;
    };

    const getAssistantReply = (text) => {
        const input = normalizeText(text);

        if (hasAnyPhrase(input, ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'])) {
            return `Hey! I'm Mirvin's portfolio assistant. I can help you explore his projects, skills, experience, and career interests. Ask me anything!`;
        }

        // Value proposition & unique angle
        if (
            hasAnyPhrase(input, ['what makes john different', 'why john', 'why mirvin', 'unique', 'differentiator', 'stand out', 'competitive advantage', 'why hire']) ||
            (refersToMirvin(input) && hasAnyPhrase(input, ['unique', 'different', 'stand out']))
        ) {
            return `Mirvin bridges user needs and technical execution—building scalable systems that actually solve real problems. He combines Cum Laude academics, real government internship impact (30% efficiency gain), and full-stack project delivery with proven security architecture. He thinks like a product strategist, not just a coder.`;
        }

        if (
            hasAnyPhrase(input, ['who is john mirvin sarte', 'who is john mirvin rion sarte', 'introduce john', 'introduce mirvin']) ||
            hasAllPhrases(input, ['who is', 'john']) ||
            hasAnyPhrase(input, ['professional summary', 'profile summary', 'about john', 'about mirvin', 'who are you', 'tell me about yourself'])
        ) {
            return `${knowledgeBase.name} is an ${knowledgeBase.title} based in ${knowledgeBase.location}. ${knowledgeBase.summary} His core strength: bridging user needs with scalable technical solutions.`;
        }

        if (hasAnyPhrase(input, ['location', 'where is he based', 'where is john based', 'where is mirvin based', 'where are you based', 'based in'])) {
            return `Current location: ${knowledgeBase.location}.`;
        }

        if (hasAnyPhrase(input, ['education', 'graduate', 'bicol university', 'school', 'coursework', 'cum laude', 'where did you study'])) {
            return knowledgeBase.education;
        }

        if (hasAnyPhrase(input, ['experience', 'internship', 'intern', 'sss', 'work experience', 'what experience do you have'])) {
            return knowledgeBase.experience;
        }

        if (hasAnyPhrase(input, ['capstone project', 'major project', 'project', 'rural health unit', 'patient records', 'healthcare information system', 'tell me about your project'])) {
            return `${knowledgeBase.project} ${knowledgeBase.projectImpact} Key learning: building enterprise systems with real stakeholder impact requires both technical depth and business acumen.`;
        }

        if (hasAnyPhrase(input, ['certification', 'certifications', 'certificate', 'oci', 'oracle', 'what certifications do you have'])) {
            return knowledgeBase.certifications;
        }

        if (hasAnyPhrase(input, ['achievement', 'achievements', 'deans lister', 'honor graduate', 'top 8', 'civil service', 'awards'])) {
            return knowledgeBase.achievements;
        }

        if (hasAnyPhrase(input, ['programming languages', 'what programming languages', 'languages does he use', 'languages does john use', 'what programming languages do you use'])) {
            return `Programming languages: ${knowledgeBase.technicalSkills.languages}.`;
        }

        if (hasAnyPhrase(input, ['framework', 'frameworks', 'libraries', 'react', 'bootstrap', 'vue', 'laravel', 'what frameworks do you use'])) {
            return `Frameworks and libraries: ${knowledgeBase.technicalSkills.frameworks}.`;
        }

        if (hasAnyPhrase(input, ['database', 'databases', 'mysql', 'mongodb', 'what databases do you use'])) {
            return `Databases: ${knowledgeBase.technicalSkills.databases}.`;
        }

        if (hasAnyPhrase(input, ['tools', 'platforms', 'tech stack', 'technical skills', 'skills', 'specializations', 'what technologies', 'technologies does he know', 'what technologies do you know', 'what skills do you have'])) {
            return `Technical profile — Languages: ${knowledgeBase.technicalSkills.languages}; Frameworks: ${knowledgeBase.technicalSkills.frameworks}; Databases: ${knowledgeBase.technicalSkills.databases}; Tools: ${knowledgeBase.technicalSkills.tools}; Platforms: ${knowledgeBase.technicalSkills.platforms}; Specializations: ${knowledgeBase.technicalSkills.specializations}.`;
        }

        if (hasAnyPhrase(input, ['soft skills', 'communication', 'leadership', 'problem solving', 'collaboration', 'stakeholder', 'what are your soft skills'])) {
            return `Soft skills: ${knowledgeBase.softSkills}`;
        }

        if (hasAnyPhrase(input, ['spoken languages', 'what languages does he speak', 'what languages do you speak', 'english', 'tagalog', 'bikol'])) {
            return `Spoken languages: ${knowledgeBase.spokenLanguages}`;
        }

        if (
            hasAnyPhrase(input, [
                'why should a company hire john',
                'why hire john',
                'why hire mirvin',
                'why should we hire him',
                'why should we hire john',
                'why should we hire you',
                'why we should hire you',
                'why should i hire you',
                'why hire you',
                'why would we hire you',
                'why should a company hire you'
            ]) ||
            (refersToMirvin(input) && hasAnyPhrase(input, ['hire', 'fit for role', 'best candidate', 'good fit']))
        ) {
            return `${knowledgeBase.name} combines Cum Laude academic excellence, real government internship impact (800–1000 member support, 30% efficiency gains), and enterprise-grade project delivery. But here's the differentiator: he builds systems thinking about both users and business outcomes. He'll solve problems strategically, not just technically.`;
        }

        if (hasAnyPhrase(input, ['role', 'roles', 'position', 'job', 'career interests', 'what roles is he looking for', 'what role is he looking for', 'what roles are you looking for', 'what job are you looking for'])) {
            return knowledgeBase.interests;
        }

        if (hasAnyPhrase(input, ['contact', 'email', 'linkedin', 'github', 'reach out', 'how to contact', 'how can i contact you'])) {
            return knowledgeBase.contact;
        }

        // Smarter fallback with better suggestions
        return `I can help with profile, education, experience, major project, certifications, achievements, technical skills, soft skills, and career fit. Try asking: What makes Mirvin different?, Tell me about the capstone project, Why should you hire Mirvin?, What's his tech stack?, or How can I contact Mirvin?`;
    };

    const appendMessage = (text, role) => {
        if (!assistantMessages) return;
        const message = document.createElement('article');
        message.className = `assistant-message ${role}`;

        if (role === 'bot') {
            message.innerHTML = `
                <div class="assistant-message-head">
                    <img src="Assets/main-image.jpg" alt="Mirvin avatar" class="assistant-bubble-avatar">
                    <span>Mirvin</span>
                </div>
                <div class="assistant-bubble"></div>
            `;
            const bubble = message.querySelector('.assistant-bubble');
            if (bubble) {
                bubble.textContent = text;
            }
        } else {
            message.innerHTML = '<div class="assistant-bubble"></div>';
            const bubble = message.querySelector('.assistant-bubble');
            if (bubble) {
                bubble.textContent = text;
            }
        }

        assistantMessages.appendChild(message);
        assistantMessages.scrollTop = assistantMessages.scrollHeight;
    };

    assistantToggle?.addEventListener('click', () => {
        if (!assistantPanel) return;
        assistantPanel.hidden = false;
        requestAnimationFrame(() => assistantPanel.classList.add('is-open'));
        assistantText?.focus();

        assistantToggle.animate(
            [
                { transform: 'scale(1)' },
                { transform: 'scale(1.12)' },
                { transform: 'scale(1)' }
            ],
            { duration: 260, easing: 'ease-out' }
        );
    });

    assistantClose?.addEventListener('click', () => {
        if (!assistantPanel) return;
        assistantPanel.classList.remove('is-open');
        setTimeout(() => {
            assistantPanel.hidden = true;
        }, 220);
    });

    assistantForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        const userMessage = assistantText?.value.trim();
        if (!userMessage) return;

        appendMessage(userMessage, 'user');
        if (assistantText) assistantText.value = '';

        setTimeout(async () => {
            try {
                const protectedReply = await getProtectedAssistantReply(userMessage);
                if (protectedReply) {
                    appendMessage(protectedReply, 'bot');
                    return;
                }
            } catch (error) {
                console.warn('Protected AI fallback triggered:', error);
            }

            const response = getAssistantReply(userMessage);
            appendMessage(response, 'bot');
        }, 220);
    });

    assistantText?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            assistantForm?.requestSubmit();
        }
    });

})();
