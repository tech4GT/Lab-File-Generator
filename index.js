const fs = require('fs'),
    os = require('os'),
    markdownpdf = require('markdown-pdf'),
    exec = require('child_process').exec;

(function main() {
    let readline = require('readline-sync'),
        author = readline.question('Author: '),
        heading = readline.question('Heading: '),
        pracDir = readline.question('Practicals Directory: '),
        listFile = readline.question('Path to list of practicals file: '),
        outputDir = readline.question('Output directory: '),
        ext = readline.question('File Extension: '),
        run_command = readline.question('Run Command(replace filename with `file`: ');

    if (os.platform() == "win32") {
        pracDir = pracDir.charAt(pracDir.length - 1) === "\\" ? pracDir : pracDir + "\\";
        outputDir = outputDir.charAt(outputDir.length - 1) === "\\" ? outputDir : outputDir + "\\";
    }
    else {
        pracDir = pracDir.charAt(pracDir.length - 1) == "/" ? pracDir : pracDir + "/";
        outputDir = outputDir.charAt(outputDir.length - 1) == "/" ? outputDir : outputDir + "/";
    }

    let files = getFilesList(pracDir, ext);
    getOutputs({}, files, 0, run_command, pracDir, outputs => {

        // write main heading and index data
        let headerData = fs.readFileSync(listFile);
        var stream = fs.createWriteStream(`${outputDir}file.md`, { flags: 'a' });
        stream.write(generateFirstPage(heading, headerData, author));

        //write the practicals
        for (let file of files) {
            const data = fs.readFileSync(pracDir + file);
            stream.write("  \n  \n  \n  ## **Practical " + file.split(".")[0] +
                "**\n```\n" + data + "\n```\n" +
                "### _Output_\n```\n" + outputs[file] + "\n```\n");
        }
        stream.end();

        //generate pdf
        markdownpdf().from(`${outputDir}file.md`).to(`${outputDir}file.pdf`, function() {
            console.log("Done!")
        });
    });
})();


function getFilesList(pracDir, ext) {
    return fs.readdirSync(pracDir)
        .filter(el => el.split('.')[1] == ext ? true : false)
        .sort((a, b) => parseInt(a.split('.')[0]) - parseInt(b.split('.')[0]));
}


function getOutputs(outputs, files, i, run_command, pracDir, cb) {

    if (i == files.length)
        return cb(outputs);

    var data = "",
        strm = exec(run_command.split("file")[0] + pracDir + files[i] + (run_command.split("file")[1]));
    process.stdin.pipe(strm.stdin);
    process.stdin.pipe(strm.stdout);
    strm.stdout.on("data", function(chunk) {
        data += chunk;
        console.log(data);
    });
    strm.on("close", function() {
        outputs[files[i]] = data.toString();
        getOutputs(outputs, files, i + 1, run_command, pracDir, cb)
    });
}

function generateFirstPage(heading, headerData, author) {
    return !!heading ? `\t ${author}\n# **${heading}**\n\n## Index\n${headerData}\n` : `\t ${author}\n${headerData}\n`;
}