with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# Desktop Auth Button
desktop_old = """              ) : !isAdmin && (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="flex items-center justify-center w-8 h-8 border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-surface)] transition-colors"
                  aria-label="Admin Login"
                  title="Đăng nhập Admin"
                >
                  <User className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              )}"""
desktop_new = """              )}"""
content = content.replace(desktop_old, desktop_new)

# Mobile Auth Button
mobile_old = """              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setLoginOpen(true);
                }}
                className="flex items-center justify-center w-12 h-12 border border-[var(--border-default)] rounded-full hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mt-auto"
                title="Đăng nhập Admin"
              >
                <User className="w-5 h-5" />
              </button>
            )}"""
mobile_new = """              </button>
            )}"""
content = content.replace(mobile_old, mobile_new)

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
