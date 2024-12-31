#!/usr/bin/env node
import fs from "node:fs/promises";
import meow from "meow";
import chalk from "chalk";
import cliErrorHandler from "cli-error-handler";
import cliHandleUnhandled from "cli-handle-unhandled";
import dotenv from "dotenv/config";
import ora from "ora";
import init from "./utils/init.js";
import { fileURLToPath } from "url";
import path from "path";
const dim = chalk.dim;

const apiURL = `https://api.tfl.gov.uk/Line/{lines}/Status?app_id=${process.env.TFL_APP_ID}&app_key=${process.env.TFL_API_KEY}`;

cliHandleUnhandled();

// CLI setup
const options = {
  importMeta: import.meta,
  inferType: true,
  flags: {
    lines: {
      type: "string",
      shortFlag: "l",
    },
    detailed: {
      type: "boolean",
      shortFlag: "d",
    },
  },
};

const helpText = `
    USAGE
    npx tubestats --flags --options

    FLAGS 
    --line -l       line(s) you want to get status for ${dim(
      `If not declared, all lines show`
    )}

    HELP
    tubestats --help
`;
const cli = meow(helpText, options);

const getActiveColour = function (line) {
  let lineColour;
  switch (line) {
    case "bakerloo":
      lineColour = chalk.bgHex("#B36305");
      break;
    case "victoria":
      lineColour = chalk.bgHex("#0098D4");
      break;
    case "central":
      lineColour = chalk.bgHex("#E32017");
      break;
    case "circle":
      lineColour = chalk.bgHex("#FFD300");
      break;
    case "district":
      lineColour = chalk.bgHex("#00782A");
      break;
    case "hammersmith-city":
      lineColour = chalk.bgHex("#F3A9BB");
      break;
    case "jubilee":
      lineColour = chalk.bgHex("#A0A5A9");
      break;
    case "metropolitan":
      lineColour = chalk.bgHex("#9B0056");
      break;
    case "northern":
      lineColour = chalk.bgHex("#000000");
      break;
    case "piccadilly":
      lineColour = chalk.bgHex("#003688");
      break;
    case "waterloo-city":
      lineColour = chalk.bgHex("#95CDBA");
      break;
    case "dlr":
      lineColour = chalk.bgHex("#00A4A7");
      break;
    case "overground":
      lineColour = chalk.bgHex("#EE7C0E");
      break;
    case "tram":
      lineColour = chalk.bgHex("#84B817");
      break;
    default:
      lineColour = chalk.bgHex("#808080");
      break;
  }

  return lineColour;
};

if (cli.input.includes("init")) {
  if (!cli.flags.appId || !cli.flags.apiKey) {
    cliErrorHandler("Incorrect init flags", {
      name: "Init flag declaration",
      message: "check you added the correct flags, tubestat --help for help",
    });
  }
  // Initialise CLI with credentials
  const envString = `TFL_APP_ID=${cli.flags.appId}\nTFL_API_KEY=${cli.flags.apiKey}
  `;
  try {
    const spinner = ora({ text: "" });
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const fileToWrite = path.join(__dirname, ".env");

    await fs.writeFile(fileToWrite, envString);
    spinner.succeed("Finished creating .env file");
  } catch (err) {
    cliErrorHandler("Error creating and writing .env file", err);
  }
} else {
  //  CLI run
  const spinner = ora({ text: "" });
  const regexPattern = new RegExp("^[a-zA-Z,]*$");
  const strCheck = regexPattern.test(`${cli.flags.line}`);

  if (!strCheck) {
    cliErrorHandler("Line error", {
      name: "Incorrect line definitions",
      message:
        "make lines only includes valid tube lines, comma separated with no spaces!",
    });
  }

  const displayLineMessages = function (statuses) {
    for (const status of statuses) {
      const activeLineColour = getActiveColour(status.id);

      let logMessage = `
    ${activeLineColour.bold(status.name)}
    ⦿ ${chalk.underline(status.lineStatuses[0].statusSeverityDescription)}
    `;

      if (status.lineStatuses[0].reason !== undefined) {
        const trimmedMessage = status.lineStatuses[0].reason
          .split(":")[1]
          .trim();
        logMessage += `⦿ ${trimmedMessage}`;
      }

      console.log(logMessage);
    }
  };

  (async function checkLines() {
    spinner.start("Checking line statuses");

    const lines =
      cli.flags.lines !== undefined
        ? cli.flags.lines
        : "bakerloo,central,circle,district,hammersmith-city,jubilee,metropolitan,northern,piccadilly,victoria,waterloo-city,dlr";
    const updatedURL = apiURL.replace("{lines}", lines);
    console.log(updatedURL);

    const res = await fetch(updatedURL);
    if (!res.ok) {
      cliErrorHandler(`Issue retrieving line data from TFL`, res.message);
    }
    const data = await res.json();
    spinner.succeed("Finished checking");
    displayLineMessages(data);
  })();
}
