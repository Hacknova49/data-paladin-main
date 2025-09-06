# Contributing to DataExplorer

Thank you for your interest in contributing to DataExplorer! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/data-explorer.git
   cd data-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## 📋 Development Guidelines

### Code Style

We use ESLint and Prettier to maintain consistent code style:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### TypeScript Guidelines

- Use strict TypeScript typing
- Avoid `any` types when possible
- Define interfaces for all props and complex objects
- Use proper return types for functions
- Leverage union types and generics appropriately

### React Best Practices

- Use functional components with hooks
- Implement proper error boundaries
- Use `useCallback` and `useMemo` for performance optimization
- Follow the single responsibility principle
- Write reusable, composable components

### Performance Considerations

- Use `React.memo` for expensive components
- Implement debouncing for search and filter operations
- Use virtual scrolling for large datasets
- Optimize bundle size with code splitting
- Profile components with React DevTools

## 🧪 Testing

### Writing Tests

- Write unit tests for utility functions
- Create integration tests for components
- Test error scenarios and edge cases
- Maintain good test coverage (aim for >80%)

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Commit Guidelines

We follow conventional commits for clear commit messages:

```
type(scope): description

feat(data): add correlation analysis
fix(ui): resolve chart rendering issue
docs(readme): update installation instructions
test(utils): add tests for data processing
refactor(hooks): optimize useDataProcessing hook
```

### Commit Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🔄 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): your descriptive message"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a descriptive title
   - Explain what changes you made
   - Reference any related issues
   - Add screenshots for UI changes

### PR Review Process

- All PRs require at least one review
- Automated tests must pass
- Code coverage should not decrease
- Documentation must be updated for new features

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment**: OS, browser, Node.js version
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Error messages**: Full error logs

Use our bug report template:

```markdown
## Bug Description
Brief description of the bug

## Environment
- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 96, Firefox 95]
- Node.js: [e.g., 18.12.0]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Additional Context
Any other context about the problem
```

## 💡 Feature Requests

For feature requests, please:

- Check if the feature already exists
- Search existing issues and discussions
- Provide a clear use case
- Explain the expected behavior
- Consider implementation complexity

## 📚 Documentation

Help improve our documentation:

- Fix typos and grammar
- Add examples and use cases
- Improve API documentation
- Create tutorials and guides
- Update README and contributing guides

## 🏗️ Architecture Guidelines

### Component Structure
```
src/components/
├── ui/                 # Reusable UI components
├── features/           # Feature-specific components
├── layout/            # Layout components
└── common/            # Shared components
```

### Hook Guidelines
- Create custom hooks for reusable logic
- Use proper dependency arrays
- Handle cleanup in useEffect
- Optimize with useCallback and useMemo

### Utility Functions
- Write pure functions when possible
- Add proper TypeScript types
- Include JSDoc comments
- Write comprehensive tests

## 🎯 Areas for Contribution

We welcome contributions in these areas:

### High Priority
- Performance optimizations
- Accessibility improvements
- Mobile responsiveness
- Error handling enhancements

### Medium Priority
- New chart types
- Advanced filtering options
- Export format support
- UI/UX improvements

### Low Priority
- Code refactoring
- Documentation improvements
- Test coverage increases
- Developer experience enhancements

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow our code of conduct
- Participate in discussions

## 📞 Getting Help

If you need help:

- Check existing documentation
- Search through issues
- Ask in discussions
- Join our Discord community
- Contact maintainers

## 🏆 Recognition

Contributors are recognized in:

- README contributors section
- Release notes
- Hall of fame page
- Special contributor badges

Thank you for contributing to DataExplorer! 🎉