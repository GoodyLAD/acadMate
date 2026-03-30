import { Project, SyntaxKind } from 'ts-morph';

async function main() {
  const project = new Project({
    tsConfigFilePath: "tsconfig.app.json",
  });

  const files = project.getSourceFiles();
  let totalFixed = 0;

  for (const sourceFile of files) {
    let changed = false;

    // Remove console.log
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    // Reverse iterate so removal doesn't shift descendants that are yet to be processed
    for (let i = callExpressions.length - 1; i >= 0; i--) {
      const callExpr = callExpressions[i];
      if (callExpr.wasForgotten()) continue;
      const expr = callExpr.getExpression();
      if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
        const text = expr.getText();
        if (text === 'console.log' || text === 'console.info' || text === 'console.debug') {
          const parent = callExpr.getParentIfKind(SyntaxKind.ExpressionStatement);
          if (parent) {
            parent.remove();
            changed = true;
          } else {
            callExpr.replaceWithText("undefined");
            changed = true;
          }
        }
      }
    }

    if (changed) {
      sourceFile.saveSync();
      // eslint-disable-next-line no-console
      console.log(`Cleaned consoles in ${sourceFile.getBaseName()}`);
    }
  }

  // Reload to ensure TS service has the latest
  const project2 = new Project({
    tsConfigFilePath: "tsconfig.app.json",
  });
  const files2 = project2.getSourceFiles();

  for (const sourceFile of files2) {
    const textBefore = sourceFile.getFullText();
    sourceFile.fixUnusedIdentifiers();
    const textAfter = sourceFile.getFullText();
    if (textBefore !== textAfter) {
      sourceFile.saveSync();
      // eslint-disable-next-line no-console
      console.log(`Fixed unused identifiers in ${sourceFile.getBaseName()}`);
      totalFixed++;
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Done. Total files with unused fixed: ${totalFixed}`);
}

main().catch(console.error);
