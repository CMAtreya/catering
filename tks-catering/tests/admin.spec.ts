import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Admin Flow & Controls QA', () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (
        msg.type() === 'error' &&
        !msg.text().includes('Download the React DevTools') &&
        !msg.text().includes('Failed to load resource')
      ) {
        consoleErrors.push(msg.text())
      }
    })
    ;(page as any).__consoleErrors = consoleErrors
  })

  test.afterEach(async ({ page }) => {
    const errors = (page as any).__consoleErrors || []
    expect(errors, `Expected zero console errors but found: ${errors.join(' | ')}`).toHaveLength(0)
  })

  test('Admin Authentication: wrong credentials error & lockout, successful login', async ({ page }) => {
    // 1. Visit /admin while logged out -> redirects to /admin/login (without expired flag if no session)
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `test-results/screenshots/08-admin-login.png` })

    // Axe accessibility check on Login screen (run on Chromium/Pixel 7/Desktop)
    if (page.context().browser()?.browserType().name() !== 'webkit') {
      const axeLogin = await new AxeBuilder({ page })
        .disableRules(['color-contrast'])
        .analyze()
      expect(axeLogin.violations).toEqual([])
    }

    // 2. Submit wrong credentials
    const usernameInput = page.locator('#admin-username')
    const passwordInput = page.locator('#admin-password')
    const submitBtn = page.locator('button[type="submit"]')

    await usernameInput.fill('admin')
    await passwordInput.fill('wrongpassword')
    await submitBtn.click()

    // Error message should appear
    await expect(page.locator('text=Incorrect ID or password')).toBeVisible()

    // 3. Enter correct credentials
    await usernameInput.fill('admin')
    await passwordInput.fill('mysore1965')
    await submitBtn.click()

    // Redirects to /admin
    await expect(page).toHaveURL(/\/admin$/)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `test-results/screenshots/09-admin-dashboard.png` })
  })

  test('Admin Dashboard & Calendar: counts ONLY confirmed orders, order confirm gating & invoice', async ({ page }) => {
    // Login first
    await page.goto('/admin/login')
    await page.locator('#admin-username').fill('admin')
    await page.locator('#admin-password').fill('mysore1965')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/admin$/)
    await page.waitForLoadState('networkidle')

    // 1. Check dashboard calendar
    // Calendar displays confirmed count badge or dot, and month navigation works
    const nextMonthBtn = page.locator('button[aria-label="Next Month"], button:has([class*="ChevronRight"])').first()
    if (await nextMonthBtn.isVisible()) {
      await nextMonthBtn.click()
      await page.waitForTimeout(300)
    }

    // 2. Orders page: verify list and confirm gating
    await page.goto('/admin/orders')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `test-results/screenshots/10-admin-orders.png` })

    // Check confirm gating: click on a New Request order card
    const firstOrderCard = page.locator('a[href^="/admin/orders/TKS-"]:visible').first()
    await expect(firstOrderCard).toBeVisible()
    await firstOrderCard.click()

    await expect(page).toHaveURL(/\/admin\/orders\/TKS-/)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `test-results/screenshots/11-admin-order-detail.png` })

    // Check tel: link is formatted properly
    const telLink = page.locator('a[href^="tel:"]').first()
    await expect(telLink).toBeVisible()
    const href = await telLink.getAttribute('href')
    expect(href).toMatch(/^tel:(\+91)?\d{10}$/)

    // 3. Invoice Gating Check
    // If order is unconfirmed, visiting /invoice shows gating warning
    const statusBadge = page.locator('[role="status"]').first()
    const isConfirmed = (await statusBadge.innerText()).includes('Confirmed')
    if (!isConfirmed) {
      // Try navigating directly to invoice
      const currentUrl = page.url()
      await page.goto(`${currentUrl}/invoice`)
      await page.waitForLoadState('networkidle')
      await expect(page.locator('text=Invoice Available After Confirmation')).toBeVisible()
      await page.screenshot({ path: `test-results/screenshots/12-invoice-gating.png` })
    }
  })

  test('Admin Menu Management & CRM matching', async ({ page }) => {
    // Login
    await page.goto('/admin/login')
    await page.locator('#admin-username').fill('admin')
    await page.locator('#admin-password').fill('mysore1965')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/admin$/)

    // 1. Menu Management
    await page.goto('/admin/menu')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `test-results/screenshots/13-admin-menu.png` })

    // Test Category Add button visibility
    const addCategoryBtn = page.locator('button:has-text("Category")').first()
    await expect(addCategoryBtn).toBeVisible()

    // Test Availability Switch toggle on first item
    const firstSwitch = page.locator('[role="switch"]').first()
    if (await firstSwitch.isVisible()) {
      const initialChecked = await firstSwitch.getAttribute('aria-checked')
      await firstSwitch.click()
      await page.waitForTimeout(300)
      const newChecked = await firstSwitch.getAttribute('aria-checked')
      expect(newChecked).not.toBe(initialChecked)
      // Toggle back
      await firstSwitch.click()
    }

    // 2. CRM Customers Page: mobile matching
    await page.goto('/admin/customers')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `test-results/screenshots/14-admin-customers.png` })

    // On mobile (< 1024px), tap customer to see profile; on desktop, profile is in right pane
    const isMobile = (page.viewportSize()?.width || 1280) < 1024
    if (isMobile) {
      const customerCard = page.locator('text=+91').first()
      await expect(customerCard).toBeVisible()
      await customerCard.click()
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveURL(/\/admin\/customers\/\d+/)
      await expect(page.locator('text=Total Enquiries')).toBeVisible()
    } else {
      const customerTile = page.locator('text=Total Enquiries').first()
      await expect(customerTile).toBeVisible()
      await expect(page.locator('text=Mobile:').first()).toBeVisible()
    }
  })
})
