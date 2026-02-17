import React, { useState } from "react";
import { Login } from "./Login";
import "./LandingPage.css";

interface LandingPageProps {
  onLoginSuccess: (userId: string, email: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return (
      <div className="login-overlay">
        <div className="login-modal">
          <button className="modal-close" onClick={() => setShowLogin(false)}>
            ×
          </button>
          <Login onLoginSuccess={onLoginSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">🏠 Smart Household Management</h1>
          <p className="hero-subtitle">
            The modern solution for managing your household with AI-powered
            efficiency
          </p>
          <div className="hero-actions">
            <button
              className="cta-button primary"
              onClick={() => setShowLogin(true)}
            >
              Get Started
            </button>
            <a href="#features" className="cta-button secondary">
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="app-preview">
            <div className="mock-phone">
              <div className="phone-screen">
                <div className="mock-app">
                  <div className="mock-header">📦 Inventory</div>
                  <div className="mock-items">
                    <div className="mock-item">🥛 Milk - 2L</div>
                    <div className="mock-item">🍞 Bread - 1 loaf</div>
                    <div className="mock-item low-stock">🥚 Eggs - 2 left</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">
            Powerful Features for Modern Households
          </h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Smart Inventory Management</h3>
              <p>
                Track food & household items with automatic expiration alerts
                and low-stock notifications.
              </p>
              <ul className="feature-list">
                <li>✓ Barcode & receipt scanning</li>
                <li>✓ Expiration date tracking</li>
                <li>✓ Storage location management</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Multi-User Collaboration</h3>
              <p>
                Color-coded profiles for household members with real-time sync
                across all devices.
              </p>
              <ul className="feature-list">
                <li>✓ Individual consumption tracking</li>
                <li>✓ Personal task assignments</li>
                <li>✓ Activity analytics</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🧹</div>
              <h3>Intelligent Chore System</h3>
              <p>
                Automated scheduling with priority-based task ordering and
                completion tracking.
              </p>
              <ul className="feature-list">
                <li>✓ Room-based organization</li>
                <li>✓ Auto due date calculation</li>
                <li>✓ Progress monitoring</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Suggestions</h3>
              <p>
                Smart recommendations using advanced AI for meal planning and
                shopping optimization.
              </p>
              <ul className="feature-list">
                <li>✓ Natural language input</li>
                <li>✓ Consumption pattern analysis</li>
                <li>✓ Meal planning assistance</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics Dashboard</h3>
              <p>
                Comprehensive insights into household consumption patterns and
                efficiency metrics.
              </p>
              <ul className="feature-list">
                <li>✓ Usage trend analysis</li>
                <li>✓ Cost optimization tips</li>
                <li>✓ Performance tracking</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Real-time Sync</h3>
              <p>
                Seamless synchronization across devices with offline support and
                instant updates.
              </p>
              <ul className="feature-list">
                <li>✓ Cross-device compatibility</li>
                <li>✓ Offline functionality</li>
                <li>✓ Cloud backup</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2>Transform Your Household Management</h2>
              <div className="benefits-list">
                <div className="benefit">
                  <span className="benefit-icon">⏰</span>
                  <div>
                    <h4>Save Time</h4>
                    <p>
                      Reduce planning time by 70% with automated suggestions and
                      smart scheduling
                    </p>
                  </div>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">💰</span>
                  <div>
                    <h4>Reduce Waste</h4>
                    <p>
                      Cut food waste by up to 40% with expiration tracking and
                      consumption insights
                    </p>
                  </div>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">🎯</span>
                  <div>
                    <h4>Stay Organized</h4>
                    <p>
                      Keep your household running smoothly with coordinated
                      tasks and inventory
                    </p>
                  </div>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">🔍</span>
                  <div>
                    <h4>Gain Insights</h4>
                    <p>
                      Make data-driven decisions about your household
                      consumption and habits
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="benefits-visual">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">70%</div>
                  <div className="stat-label">Time Saved</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">40%</div>
                  <div className="stat-label">Less Waste</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Sync Access</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">AI</div>
                  <div className="stat-label">Powered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-section">
        <div className="container">
          <h2 className="section-title">Built with Modern Technology</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <span className="tech-icon">⚛️</span>
              <span>React 18</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🔷</span>
              <span>TypeScript</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🗄️</span>
              <span>Supabase</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🤖</span>
              <span>Groq AI</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">📱</span>
              <span>PWA Ready</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🔒</span>
              <span>Secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Household?</h2>
            <p>
              Join thousands of families already using our platform to
              streamline their daily lives
            </p>
            <button
              className="cta-button primary large"
              onClick={() => setShowLogin(true)}
            >
              Start Your Free Account
            </button>
            <p className="cta-note">
              No credit card required • Free forever plan available
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🏠 Smart Household Management</h3>
              <p>
                Bringing intelligence to household management with modern
                technology and AI.
              </p>
            </div>
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li>Inventory Management</li>
                <li>Multi-User Support</li>
                <li>Smart Chores</li>
                <li>AI Suggestions</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Technology</h4>
              <ul>
                <li>React & TypeScript</li>
                <li>Real-time Sync</li>
                <li>Cloud Storage</li>
                <li>Mobile Optimized</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Community</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              &copy; 2026 Smart Household Management. Built with ❤️ for modern
              families.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
