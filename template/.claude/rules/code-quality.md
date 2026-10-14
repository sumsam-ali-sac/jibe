# Code quality and security (always applies)

- Small, single-purpose functions; early returns over deep nesting; names say what things do.
- Full type annotations on public functions, props and return values. No `Any`/`any` unless unavoidable, and say why.
- Handle errors explicitly at the right layer; never swallow exceptions or empty-catch.
- No dead code, commented-out code, debug prints or stray `console.log` in a final diff.
- Comments explain *why*, not *what*. Match the surrounding comment density.
- Search for an existing helper/component before writing a new one.
- No new dependency without stating why, checking it's maintained, and adding it with the package manager.
- Validate every input at trust boundaries (HTTP, forms, env, files, third-party responses).
- Never hardcode secrets, tokens, real hostnames or credentials. Never log secrets or personal data.
- Authorization is checked server-side for every resource access; the UI hiding a button is not security.
