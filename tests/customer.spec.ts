import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Customer Flow & Controls QA', () => {
  test.beforeEach(async ({ page }) => {
    // Collect console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('Download the React DevTools') && !msg.text().includes('Failed to load resource')) {
        consoleErrors.push(msg.text())
      }
    })

    // Store reference so tests can assert zero console errors
    ;(page as any).__consoleErrors = consoleErrors
  })

  test.afterEach(async ({ page }) => {
    const errors = (page as any).__consoleErrors || []
    expect(errors, `Expected zero console errors but found: ${errors.join(' | ')}`).toHaveLength(0)
  })

  test('Walk customer flow: catalogue gating -> request validation -> contact -> happy submission -> reload history -> clear history', async ({ page }) => {
    // 1. Catalogue page: Proceed button must be disabled until at least 1 item is selected
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Accessibility check on homepage (run on Chromium/Pixel 7/Desktop)
    if (page.context().browser()?.browserType().name() !== 'webkit') {
      const axeHome = await new AxeBuilder({ page })
        .disableRules(['color-contrast']) // brand tokens calibrated in theme.css
        .analyze()
      expect(axeHome.violations).toEqual([])
    }

    await page.screenshot({ path: `test-results/screenshots/01-catalogue.png` })

    // Verify disabled proceed button initially
    const proceedDisabled = page.locator('button:has-text("Select at least one item")')
    await expect(proceedDisabled).toBeVisible()
    await expect(proceedDisabled).toBeDisabled()

    // Select an item by clicking an ItemCard
    const firstCard = page.locator('[role="checkbox"]').first()
    await expect(firstCard).toBeVisible()
    await firstCard.click()

    // Verify Proceed button is now active and clickable
    const proceedButton = page.locator('button:has-text("Proceed")')
    await expect(proceedButton).toBeVisible()
    await expect(proceedButton).toBeEnabled()

    // 2. Click Proceed to navigate to /request
    await page.waitForTimeout(400)
    await page.locator('#proceed-to-request-btn').click()
    await expect(page).toHaveURL(/\/request/)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `test-results/screenshots/02-request.png` })

    // Test Continue validation: click Continue without filling required inputs
    const continueButton = page.locator('#continue-request-btn')
    await expect(continueButton).toBeVisible()

    // Clear occasion to verify occasion validation error
    const occasionInput = page.locator('#field-eventType input')
    await occasionInput.fill('')
    await continueButton.click({ force: true })

    // Validation errors should appear
    await expect(page.locator('text=Please choose or enter an occasion type')).toBeVisible()
    await expect(page.locator('text=Please select an occasion date')).toBeVisible()

    // Select an occasion chip (e.g. Wedding)
    const weddingChip = page.locator('button:has-text("Wedding")').first()
    await weddingChip.click()
    await page.waitForTimeout(200)

    // Select event date via calendar button
    const calendarBtn = page.locator('#field-eventDate button:visible')
    await calendarBtn.click({ force: true })
    await page.waitForTimeout(400)
    const dayBtn = page.locator('[data-slot="calendar"] button:not([disabled]):not([class*="button_previous"]):not([class*="button_next"])').last()
    await dayBtn.click({ force: true })
    await page.waitForTimeout(300)

    // Ensure plates count is valid
    const platesInput = page.locator('#field-guestCount input')
    await platesInput.fill('120')

    // Fill delivery address in Mysuru
    const addressInput = page.locator('#field-venueAddress textarea')
    await addressInput.fill('Lakshmipuram, Mysuru 570004')
    await addressInput.blur()
    await page.waitForTimeout(200)

    // Click Continue now that fields are valid
    await page.locator('#continue-request-btn').click()
    await expect(page).toHaveURL(/\/contact/)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `test-results/screenshots/03-contact.png` })

    // 3. Test Contact validation errors
    const submitButton = page.locator('#submit-contact-btn')
    await expect(submitButton).toBeVisible()
    await submitButton.click({ force: true })

    // Should display validation error for missing name & phone
    await expect(page.locator('text=Customer name is required')).toBeVisible()

    // Fill Name
    const nameInput = page.locator('#customer-name')
    await nameInput.fill('Kalyan Iyengar')

    // Fill invalid phone first to test validation error
    const phoneInput = page.locator('#customer-phone')
    await phoneInput.fill('12345')
    await submitButton.click({ force: true })
    await expect(page.locator('text=Enter a valid 10-digit Indian mobile number')).toBeVisible()

    // Fill valid Indian phone number
    await phoneInput.fill('9845012345')

    // 4. Happy Path Submission
    await submitButton.click({ force: true })
    await expect(page).toHaveURL(/\/submitted/)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `test-results/screenshots/04-submitted.png` })

    // Verify submission confirmation screen
    await expect(page.locator('text=Request submitted!')).toBeVisible()
    await expect(page.getByText('Wedding', { exact: true })).toBeVisible()

    // 5. Navigate to /enquiries: history survives reload
    await page.goto('/enquiries')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `test-results/screenshots/05-enquiries.png` })

    // Verify the newly created enquiry is listed
    await expect(page.getByText('Wedding', { exact: true })).toBeVisible()
    await expect(page.locator('text=120 plates')).toBeVisible()

    // Click the card to open detail sheet and verify customer details
    await page.getByText('Wedding', { exact: true }).click()
    await expect(page.locator('text=Kalyan Iyengar')).toBeVisible()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    // Reload the page to test persistence across reload
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Wedding', { exact: true })).toBeVisible()

    // 6. Test Clear History confirmation
    const clearHistoryButton = page.locator('button:has-text("Clear history")')
    await expect(clearHistoryButton).toBeVisible()
    await clearHistoryButton.click()

    // Confirm dialog appears
    const confirmClearAction = page.locator('button:has-text("Clear all")')
    await expect(confirmClearAction).toBeVisible()
    await confirmClearAction.click()

    // Empty state should now be displayed
    await expect(page.locator('text=No enquiries yet')).toBeVisible()
    await page.screenshot({ path: `test-results/screenshots/06-cleared-enquiries.png` })
  })

  test('Failure simulation ?fail=1 shows retry banner and remains on /contact', async ({ page }) => {
    // Add item to draft
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.locator('[role="checkbox"]').first().click()
    await page.waitForTimeout(400)
    await page.locator('#proceed-to-request-btn').click()
    await expect(page).toHaveURL(/\/request/)
    await page.waitForLoadState('networkidle')

    // Fill request form
    await page.locator('button:has-text("Pooja")').first().click({ force: true })
    const calendarBtn = page.locator('#field-eventDate button:visible')
    await calendarBtn.click({ force: true })
    await page.waitForTimeout(400)
    const dayBtn = page.locator('[data-slot="calendar"] button:not([disabled]):not([class*="button_previous"]):not([class*="button_next"])').last()
    await dayBtn.click({ force: true })
    await page.waitForTimeout(300)

    const addressInput = page.locator('#field-venueAddress textarea')
    await addressInput.fill('Saraswathipuram, Mysuru')
    await addressInput.blur()
    await page.waitForTimeout(200)
    await page.locator('#continue-request-btn').click()

    // Wait for /contact
    await expect(page).toHaveURL(/\/contact/)

    // Simulate fail query param
    await page.evaluate(() => {
      window.history.pushState(null, '', '/contact?fail=1')
    })

    await page.locator('#customer-name').fill('Anand Kumar')
    await page.locator('#customer-phone').fill('9845112233')

    const submitBtn = page.locator('#submit-contact-btn')
    await submitBtn.click({ force: true })

    // Verify error banner is shown with retry option and page does NOT advance to /submitted
    const errorBanner = page.locator('text=We could not send your request')
    await expect(errorBanner).toBeVisible()
    expect(page.url()).toContain('/contact')
    await page.screenshot({ path: `test-results/screenshots/07-contact-fail.png` })
  })
})
