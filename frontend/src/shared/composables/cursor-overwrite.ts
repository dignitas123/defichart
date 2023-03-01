export function useCursorOverwrite() {
  /**
   * This function sets the cursor and overwrites all other cursor
   * @param cursor: must be declared in src/css/app.scss like f.e.:
   *                  html.ns-resize, html.ns-resize * {
   *                    cursor: ns-resize !important;
   *                  }
   */
  function setCursor(cursor: string) {
    document.documentElement.classList.add(cursor);
  }

  function removeCursor(cursor: string) {
    document.documentElement.classList.remove(cursor);
  }

  return {
    setCursor,
    removeCursor,
  };
}
