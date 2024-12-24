#!/usr/bin/env node
import meow from "meow";
import chalk from "chalk";
import cliErrorHandler from "cli-error-handler";
import dotenv from "dotenv/config";
import fs from "fs";
const dim = chalk.dim;
const apiURL = ``;

// Helpers
const getActiveColour = function (line) {
  let lineColour;
  switch (line) {
    case "bakerloo":
      lineColour = chalk.bgYellow;
      break;
    case "victoria":
      lineColour = chalk.bgBlue;
      break;
    case "central":
      lineColour = chalk.bgRed;
      break;
    case "circle":
      lineColour = chalk.bgYellowBright;
      break;
    case "district":
      lineColour = chalk.bgGreen;
      break;
    case "hammersmith & city":
      lineColour = chalk.bgMagenta;
      break;
    case "jubilee":
      lineColour = chalk.bgWhiteBright;
      break;
    case "metropolitan":
      lineColour = chalk.bgMagentaBright;
      break;
    case "northern":
      lineColour = chalk.bgBlack;
      break;
    case "piccadilly":
      lineColour = chalk.bgBlueBright;
      break;
    case "waterloo & city":
      lineColour = chalk.bgCyanBright;
      break;
    case "dlr":
      lineColour = chalk.bgCyan;
      break;
    case "overground":
      lineColour = chalk.bgOrange;
      break;
    case "tram":
      lineColour = chalk.bgGreenBright;
      break;
    default:
      lineColour = chalk.bgGray;
      break;
  }
  return lineColour;
};

// CLI setup
const options = {
  importMeta: import.meta,
  inferType: true,
  flags: {
    line: {
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
    --detailed -d   detailed information about status, including delays, incidents and their occurrences ${dim(
      `If not declared, only status description is shown`
    )}

    HELP
    tubestats --help

`;
const cli = meow(helpText, options);

//  CLI run
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
    console.log(`
${activeLineColour.bold(status.name)}
⦿ ${status.lineStatuses[0].statusSeverityDescription}
⦿ ${status.lineStatuses[0].reason}
 `);
  }
};

(async function checkLines() {
  const res = await fetch(`${apiURL}/${cli.flags.line}`);
  if (!ok) {
    cliErrorHandler(`Issue retrieving line data from TFL`, res.message);
  }
  const data = await res.json();
  displayLineMessages(data);
})();

fs.readFile("./sample-response.json", "utf-8", (err, data) => {
  const jsonData = JSON.parse(data);

  displayLineMessages(jsonData);
});
