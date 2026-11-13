import { test, expect } from '@playwright/test'

test.describe('Time Option Selection & Panchangam Removal QA', () => {
  test('Verify Panchangam is removed and Time Selection (Morning, Afternoon, Evening + Specific Time) works end-to-end', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Select an item on catalogue
    const firstCard = page.locator('[role="checkbox"]').first()
    await firstCard.click()

    // Proceed to /request
    await page.locator('#proceed-to-request-btn').click()
    await expect(page).toHaveURL(/\/request/)
    await page.waitForLoadState('networkidle')

    // 1. Verify Mysuru Panchanga is removed
    await expect(page.locator('text=Mysuru Panchanga Aligned')).not.toBeVisible()
    await expect(page.locator('text=Karthika Somavara')).not.toBeVisible()

    // 2. Verify 3 Time Option slots exist
    const morningBtn = page.locator('#field-eventTime button:has-text("Morning")')
    const afternoonBtn = page.locator('#field-eventTime button:has-text("Afternoon")')
    const eveningBtn = page.locator('#field-eventTime button:has-text("Evening")')

    await expect(morningBtn).toBeVisible()
    await expect(afternoonBtn).toBeVisible()
    await expect(eveningBtn).toBeVisible()

    // By default, Morning is selected
    await expect(morningBtn).toHaveClass(/border-primary/)

    // Switch to Afternoon
    await afternoonBtn.click()
    await expect(afternoonBtn).toHaveClass(/border-primary/)

    // Switch to Evening
    await eveningBtn.click()
    await expect(eveningBtn).toHaveClass(/border-primary/)

    // Switch back to Morning
    await morningBtn.click()
    await expect(morningBtn).toHaveClass(/border-primary/)

    // 3. Verify Specific Serving Time block is removed
    await expect(page.locator('text=Specific Serving Time')).not.toBeVisible()
    await expect(page.locator('text=Quick Picks:')).not.toBeVisible()

    // 4. Fill rest of form and verify carryover to /contact
    const weddingChip = page.locator('button:has-text("Wedding")').first()
    await weddingChip.click()

    const calendarBtn = page.locator('#field-eventDate button:visible')
    await calendarBtn.click({ force: true })
    await page.waitForTimeout(300)
    const dayBtn = page.locator('[data-slot="calendar"] button:not([disabled]):not([class*="button_previous"]):not([class*="button_next"])').last()
    await dayBtn.click({ force: true })
    await page.waitForTimeout(200)

    await page.locator('#field-guestCount input').fill('150')
    await page.locator('#field-venueAddress textarea').fill('Kalyana Mantapa, Saraswathipuram, Mysuru')

    // Click continue
    await page.locator('#continue-request-btn').click()
    await expect(page).toHaveURL(/\/contact/)
    await page.waitForLoadState('networkidle')

    // Verify contact page summary shows Morning Service
    await expect(page.locator('text=Morning Service')).toBeVisible()
    await expect(page.locator('text=Event Date & Time:')).toBeVisible()
  })
})

