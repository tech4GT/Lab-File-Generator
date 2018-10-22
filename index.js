(async function() {
    let readline = require('readline-sync'),
        fs = require('fs'),
        os = require('os'),
        exec = require('child_process').execSync,
        author = readline.question('Author: '),
        heading = readline.question('Heading: '),
        pracDir = readline.question('Practicals Directory: '),
        listFile = readline.question('Path to list of practicals file: '),
        outputDir = readline.question('Output directory: '),
        ext = readline.question('File Extension: '),
        run_command = readline.question('Run Command(replace filename with `(file)`');

    if (os.platform() == "win32") {
        pracDir = pracDir.charAt(pracDir.length - 1) === "\\" ? pracDir : pracDir + "\\";
        outputDir = outputDir.charAt(outputDir.length - 1) === "\\" ? outputDir : outputDir + "\\";
    }
    else {
        pracDir = pracDir.charAt(pracDir.length - 1) == "/" ? pracDir : pracDir + "/";
        outputDir = outputDir.charAt(outputDir.length - 1) == "/" ? outputDir : outputDir + "/";
    }
    let files =
        fs.readdirSync(pracDir)
            .filter(el => el.split('.')[1] == ext ? true : false)
            .sort((a, b) => parseInt(a.split('.')[0]) - parseInt(b.split('.')[0])),
        index;

    //calulate outputs
    const outputs = {};
    for (let file of files) {
        const data = exec(run_command.split("(file)")[0] + pracDir + file + (run_command.split("(file)")[1]));
        outputs[file] = data.toString();
    }


    // write main heading and index data
    let headerData = fs.readFileSync(listFile);
    var stream = fs.createWriteStream(`${outputDir}file.md`, { flags: 'a' });
    stream.write(`# ${heading}\n-- ${author}\n${headerData}\n`)

    for (let file of files) {
        const data = fs.readFileSync(pracDir + file);
        stream.write("## Practical " + file.split(".")[0] +
            "\n```\n" + data + "\n```\n" +
            "### Output\n```\n" + outputs[file] + "\n```\n");
    }

    stream.end();
})();