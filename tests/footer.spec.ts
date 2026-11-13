import { test, expect } from '@playwright/test'

test.describe('AppFooter 10 Items & Responsiveness Verification', () => {
  const viewports = [
    { name: 'Mobile', width: 390, height: 844 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 800 },
  ]

  for (const vp of viewports) {
    test(`Verify footer 10 items on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const footer = page.locator('footer[role="contentinfo"]')
      await expect(footer).toBeVisible()
      await footer.scrollIntoViewIfNeeded()

      // 1. Brand Name
      await expect(footer.locator('h2:has-text("TKS Iyengar\'s Catering")')).toBeVisible()

      // 2. Legal Name
      await expect(footer.locator('text=TKS Catering Services Private Limited').first()).toBeVisible()

      // 3. Registered Office Address
      await expect(footer.locator('text=Shop 14, 5th Main Road').first()).toBeVisible()
      await expect(footer.locator('text=Vani Vilas Mohalla, Mysuru').first()).toBeVisible()

      // 4. Contact Number
      const phoneDesk = footer.locator('a[href="tel:+918212448920"]')
      await expect(phoneDesk).toBeVisible()
      const phoneDirect = footer.locator('a[href="tel:+919845012345"]')
      await expect(phoneDirect).toBeVisible()

      // 5. Business Email
      const emailLink = footer.locator('a[href="mailto:orders@tksiyengarscatering.com"]')
      await expect(emailLink).toBeVisible()

      // 6. Business Hours
      await expect(footer.locator('text=Monday – Sunday: 8:00 AM – 9:00 PM IST')).toBeVisible()
      await expect(footer.locator('text=24/7 Early Morning Muhurtham Dispatch')).toBeVisible()

      // 7. FSSAI License or Registration Number
      await expect(footer.locator('text=11223344556677').first()).toBeVisible()
      await expect(footer.locator('text=FSSAI Certified').first()).toBeVisible()

      // 8. Privacy Policy
      const privacyLink = footer.locator('a[href="/privacy-policy"]').first()
      await expect(privacyLink).toBeVisible()

      // 9. Food Allergies and Dietary Information
      const allergyLink = footer.locator('a[href="/allergy-dietary-info"]').first()
      await expect(allergyLink).toBeVisible()

      // 10. Hygiene and Food Safety Information
      const safetyLink = footer.locator('a[href="/food-safety"]').first()
      await expect(safetyLink).toBeVisible()

      // Check for zero horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth)

      // Test Quick View modals on desktop
      if (vp.name === 'Desktop') {
        // Quick view 8: Privacy
        const quickViewPrivacy = footer.locator('button:has-text("Quick view")').nth(0)
        await quickViewPrivacy.click()
        const privacyModal = page.locator('[data-slot="dialog-content"]')
        await expect(privacyModal).toBeVisible()
        await expect(privacyModal.locator('text=Privacy Policy & Client Confidentiality')).toBeVisible()
        await privacyModal.getByRole('button', { name: 'Close' }).first().click()
        await expect(privacyModal).not.toBeVisible()

        // Quick view 9: Allergies
        const quickViewAllergies = footer.locator('button:has-text("Quick view")').nth(1)
        await quickViewAllergies.click()
        const allergiesModal = page.locator('[data-slot="dialog-content"]')
        await expect(allergiesModal).toBeVisible()
        await expect(allergiesModal.locator('text=Food Allergies & Dietary Information')).toBeVisible()
        await allergiesModal.getByRole('button', { name: 'Close' }).first().click()
        await expect(allergiesModal).not.toBeVisible()

        // Quick view 10: Hygiene
        const quickViewHygiene = footer.locator('button:has-text("Quick view")').nth(2)
        await quickViewHygiene.click()
        const hygieneModal = page.locator('[data-slot="dialog-content"]')
        await expect(hygieneModal).toBeVisible()
        await expect(hygieneModal.locator('text=Hygiene & Food Safety Standards')).toBeVisible()
        await hygieneModal.getByRole('button', { name: 'Close' }).first().click()
        await expect(hygieneModal).not.toBeVisible()
      }

      // Screenshot for verification
      await footer.screenshot({ path: `test-results/screenshots/footer-${vp.name.toLowerCase()}.png` })
    })
  }
})
