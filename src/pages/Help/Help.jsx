import './Help.css';

const helpSections = [
  {
    title: 'Getting Started',
    steps: [
      'Create an account by clicking Register on the Auth page.',
      'Login with your email and password.',
      'You will be redirected to your Dashboard.',
      'Start uploading files from the Upload page.',
    ],
  },
  {
    title: 'Uploading Files',
    steps: [
      'Go to the Upload page from the navigation menu.',
      'Drag and drop a file onto the upload area, or click Browse.',
      'Wait for the upload progress to complete.',
      'Your file will appear in My Files.',
    ],
  },
  {
    title: 'Managing Files',
    steps: [
      'Visit My Files to see all your uploaded files.',
      'Use the search bar to find specific files.',
      'Use the filter tabs to sort by file type.',
      'Click View to preview, Download to save, or Delete to remove.',
    ],
  },
  {
    title: 'Customizing Settings',
    steps: [
      'Go to Settings from the navigation menu.',
      'Toggle Dark Mode for a different theme.',
      'Enable or disable notifications.',
      'Change your password if needed.',
    ],
  },
  {
    title: 'Editing Profile',
    steps: [
      'Go to Profile to view your information.',
      'Click Edit Profile to update your details.',
      'Save your changes when done.',
    ],
  },
];

export default function Help() {
  return (
    <div className="help-page page">
      <h2 className="section-title" style={{ marginBottom: '0.25rem' }}>
        Help & Guide
      </h2>
      <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
        Learn how to use EasyShare effectively.
      </p>

      <div className="help-sections">
        {helpSections.map((section, i) => (
          <div className="help-section card" key={i}>
            <div className="help-section-number">{String(i + 1).padStart(2, '0')}</div>
            <h3 className="help-section-title">{section.title}</h3>
            <ol className="help-steps">
              {section.steps.map((step, j) => (
                <li key={j} className="help-step">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
