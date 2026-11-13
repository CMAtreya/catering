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
    await expect(page.locator('button:has-text("08:30 AM (Muhurtham)")')).toBeVisible()

    // Switch to Afternoon
    await afternoonBtn.click()
    await expect(afternoonBtn).toHaveClass(/border-primary/)
    await expect(page.locator('button:has-text("12:45 PM (Feast)")')).toBeVisible()

    // Switch to Evening
    await eveningBtn.click()
    await expect(eveningBtn).toHaveClass(/border-primary/)
    await expect(page.locator('button:has-text("07:30 PM (Reception)")')).toBeVisible()

    // 3. Test choosing specific time from quick picks
    const eveningQuickPick = page.locator('button:has-text("07:30 PM (Reception)")')
    await eveningQuickPick.click()
    await expect(page.locator('text=Serving fixed at: 07:30 PM (Reception)')).toBeVisible()

    // Switch back to Morning and select Muhurtham time
    await morningBtn.click()
    const muhurthamTimeBtn = page.locator('button:has-text("08:30 AM (Muhurtham)")')
    await muhurthamTimeBtn.click()
    await expect(page.locator('text=Serving fixed at: 08:30 AM (Muhurtham)')).toBeVisible()

    // 4. Test typing custom specific time
    const timeInput = page.locator('#field-eventTime input[type="text"]')
    await timeInput.fill('08:45 AM (Auspicious Muhurtham)')
    await expect(page.locator('text=Serving fixed at: 08:45 AM (Auspicious Muhurtham)')).toBeVisible()

    // Take a screenshot of the section for the artifact
    const dateTimeSection = page.locator('#field-eventDate')
    await dateTimeSection.scrollIntoViewIfNeeded()
    await page.locator('main').screenshot({ path: 'C:/Users/CHINMAYA M/.gemini/antigravity/brain/139cbc22-bf89-42cd-93d3-bc8141b454ec/17-datetime-selection.png' })

    // 5. Fill rest of form and verify carryover to /contact
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

    // Verify contact page summary shows Morning Service and the specific time!
    await expect(page.locator('text=Morning Service • 08:45 AM (Auspicious Muhurtham)')).toBeVisible()
    await expect(page.locator('text=Event Date & Time:')).toBeVisible()
  })
})

