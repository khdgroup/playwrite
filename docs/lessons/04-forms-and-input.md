# Lesson 04 - Forms, inputs and user actions

**Spec file:** `tests/04-forms-and-input.spec.ts`

## Actionability - why there are no sleeps

Before any action, Playwright waits for the element to be:

| Check | Meaning |
| --- | --- |
| Attached | Present in the DOM |
| Visible | Non-empty box, not `display:none` / `visibility:hidden` |
| Stable | Not moving (animations finished) |
| Receives events | Not covered by an overlay, modal or cookie banner |
| Enabled | Not `disabled` (for form controls) |

Only then does it scroll the element into view and act. If a condition is never
met, you get a timeout error that *names the failing condition* - read it, it
usually points straight at the bug (e.g. "intercepts pointer events" = something
is on top of your button).

## Text input

```ts
await field.fill('standard_user');    // sets the value in one go - default choice
await field.clear();                  // same as fill('')
await field.pressSequentially('abc', { delay: 10 });  // real keystrokes
await field.press('Enter');           // single key
await page.keyboard.press('Control+A'); // page-level keyboard
```

`fill()` is faster and less flaky. Reach for `pressSequentially()` only when the
app reacts to individual keys - autocomplete, input masks, character counters.

## Clicking

```ts
await button.click();
await button.dblclick();
await button.click({ button: 'right' });
await button.click({ modifiers: ['Shift'] });
await link.hover();
await button.click({ force: true });   // skips actionability checks - see below
```

`force: true` is almost always the wrong answer. It makes a failing test pass
while the user is still blocked by whatever the overlay was.

## Selects, checkboxes and radios

```ts
await select.selectOption({ label: 'Price (low to high)' });
await select.selectOption('price-desc');   // by value
await select.selectOption({ index: 1 });
await select.selectOption(['a', 'b']);     // multi-select

await checkbox.check();      // no-op if already checked
await checkbox.uncheck();
await expect(checkbox).toBeChecked();
```

`check()` asserts the resulting state for you, which `click()` does not.

## Disabled controls

Playwright will not click a disabled button - it waits for it to become enabled
and then times out. That is the correct behaviour: a test that "clicked" a dead
button and passed would be lying. Assert `toBeDisabled()` instead.

## Common form patterns in this app

```ts
// empty field validation
await page.getByRole('button', { name: 'Log in' }).click();
await expect(page.getByTestId('login-error')).toHaveText('Username is required.');

// live search filtering
await page.getByLabel('Search products').fill('keyboard');
await expect(page.getByTestId('product-card')).toHaveCount(1);
```

## Try it yourself

- Log in by pressing Enter in the password field instead of clicking.
- Assert the search field is empty after a reload.
- Check the "Gift wrap" box, place an order, and confirm it still succeeds.

Next: [Lesson 05 - Waiting](05-waiting.md)
