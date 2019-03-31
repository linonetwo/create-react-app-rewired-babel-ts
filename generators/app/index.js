"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const path = require("path");
const to = require("to-case");

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the primo ${chalk.red(
          "generator-create-react-app-rewired-babel-ts"
        )} generator!`
      )
    );

    const prompts = [
      {
        type: "confirm",
        name: "useStyledComponents",
        message: "Would you like to enable styled-components?",
        default: true
      },
      {
        type: "confirm",
        name: "useParamMacro",
        message:
          "Would you like to enable param.macro? (works well with styled-components)",
        default: true
      },
      {
        name: "projectName",
        type: "input",
        message: "Project name:",
        default: path.basename(this.destinationPath())
      },
      {
        name: "projectDescription",
        type: "input",
        message: "Project description:"
      },
      {
        name: "projectVersion",
        type: "input",
        message: "Project version:",
        default: "0.1.0"
      },
      {
        name: "license",
        type: "input",
        message:
          "What's your License? (If you choose other than MIT, please replace LICENSE file manually)",
        default: "MIT"
      },
      {
        name: "authorName",
        type: "input",
        message: "Author name:",
        store: true
      },
      {
        name: "useYarn",
        type: "input",
        message: "Do You use Yarn?",
        default: false
      }
    ];

    return this.prompt(prompts).then(answers => {
      this.useStyledComponents = answers.useStyledComponents;
      this.projectName = answers.projectName;
      this.projectDescription = answers.projectDescription;
      this.projectVersion = answers.projectVersion;
      this.authorName = answers.authorName;
      this.useYarn = answers.useYarn;
      this.license = answers.license;
    });
  }

  writing() {
    // Public
    this.fs.copyTpl(
      this.templatePath("public/index.html"),
      this.destinationPath("public/index.html"),
      {
        projectName: to.title(this.projectName)
      }
    );
    this.fs.copyTpl(
      this.templatePath("public/manifest.json"),
      this.destinationPath("public/manifest.json"),
      {
        projectName: to.title(this.projectName)
      }
    );
    this.fs.copy(
      this.templatePath("public/favicon.ico"),
      this.destinationPath("public/favicon.ico")
    );

    // Readme
    this.fs.copyTpl(
      this.templatePath("README.md"),
      this.destinationPath("README.md"),
      {
        projectName: to.title(this.projectName),
        projectDescription: to.title(this.projectDescription)
      }
    );

    if (this.license === "MIT") {
      // License
      this.fs.copyTpl(
        this.templatePath("LICENSE"),
        this.destinationPath("LICENSE"),
        {
          year: new Date().getFullYear(),
          authorName: this.authorName
        }
      );
    }

    // Gitignore
    this.fs.copy(
      this.templatePath("gitignore"),
      this.destinationPath(".gitignore")
    );

    // Gitattributes
    this.fs.copy(
      this.templatePath("gitattributes"),
      this.destinationPath(".gitattributes")
    );

    // Babelrc.js
    this.fs.copyTpl(
      this.templatePath("babelrc.js"),
      this.destinationPath(".babelrc.js"),
      {
        styledPlugin: this.useStyledComponents
          ? `plugins: ['babel-plugin-styled-components'],`
          : ""
      },
      {
        escape: i => i
      }
    );

    // Tslintconfig
    this.fs.copyTpl(
      this.templatePath("tsconfig.json"),
      this.destinationPath("tsconfig.json"),
      {
        styledPlugin: this.useStyledComponents
          ? `"plugins": [
      {
        "name": "typescript-styled-plugin"
      }
    ],`
          : ""
      },
      {
        escape: i => i
      }
    );

    // Tslint
    this.fs.copy(
      this.templatePath("tslint.json"),
      this.destinationPath("tslint.json")
    );

    // Src
    this.fs.copy(this.templatePath("src"), this.destinationPath("src"));

    // PackageJSON
    this.fs.copyTpl(
      this.templatePath("package.json"),
      this.destinationPath("package.json"),
      {
        projectName: this.projectName,
        projectDescription: this.projectDescription,
        projectVersion: this.projectVersion,
        license: this.license,
        authorName: this.authorName
      }
    );

    // StyledComponents
    if (this.useStyledComponents) {
      this.fs.copy(
        this.templatePath("GlobalStyles.ts"),
        this.destinationPath("src/GlobalStyles.ts")
      );

      this.npmInstall([
        "styled-components",
        "styled-normalize",
        "styled-is",
        this.useParamMacro ? "param.macro" : undefined
      ]);
      this.npmInstall(
        [
          "@types/styled-components",
          "babel-plugin-styled-components",
          "typescript-styled-plugin"
        ],
        {
          "save-dev": true
        }
      );
    }
    this.fs.copyTpl(
      this.templatePath("index.tsx"),
      this.destinationPath("src/index.tsx"),
      {
        importGlobalstyle: this.useStyledComponents
          ? `import GlobalStyle from './GlobalStyles';
`
          : "",
        useGlobalstyle: this.useStyledComponents
          ? `  <>
    <GlobalStyle />
    <App />
  </>,`
          : "  <App />,"
      },
      {
        escape: i => i
      }
    );

    this.fs.copyTpl(
      this.templatePath("App.tsx"),
      this.destinationPath("src/App.tsx"),
      {
        appContainer: this.useStyledComponents
          ? `import styled from 'styled-components';

const Container = styled.div\`
  width: 100vw;
  height: 100vh;
\`;
`
          : "",
        div: this.useStyledComponents ? "Container" : "div"
      },
      {
        escape: i => i
      }
    );
  }

  install() {
    this.installDependencies({
      bower: false,
      npm: true,
      yarn: this.useYarn
    });
  }
};
