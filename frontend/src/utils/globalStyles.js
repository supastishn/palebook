import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
  }

  body {
    font-family: ${props => props.theme.typography.fontFamily.primary};
    font-size: ${props => props.theme.typography.fontSize.base};
    line-height: ${props => props.theme.typography.lineHeight.normal};
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100vh;
  }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transition: color ${props => props.theme.animations.transition};

    &:hover {
      color: ${props => props.theme.colors.primaryHover};
    }
  }

  button {
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all ${props => props.theme.animations.transition};

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  input,
  textarea {
    font-family: inherit;
    font-size: inherit;
    outline: none;
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    transition: border-color ${props => props.theme.animations.transition};

    &:focus {
      border-color: ${props => props.theme.colors.primary};
    }

    &::placeholder {
      color: ${props => props.theme.colors.textLight};
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.gray200};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.gray400};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.gray500};
  }
`;

export default GlobalStyle;