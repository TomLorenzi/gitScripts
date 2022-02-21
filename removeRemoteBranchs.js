const { exec } = require('child_process');
const fs = require('fs');
const logger = require('node-color-log');

if ('undefined' === typeof process.argv[2]) {
    console.log('Please define git repo in package.json');

    return;
}
const gitRepo = process.argv[2] + '/.git';

const query = require('cli-interact').getYesNo;
const answer = query('This will remove every branch that are not on your remote repository, this may include current work, are you sure to continue ?');

if (answer) {
    exec('git status', (err, stdout, stderr) => {
        if (null !== err) {
            logger.color('red').bold().log('No git repository');
            
            return;
        }
    });

    exec(`git --git-dir ${gitRepo} remote update origin --prune`, (err, stdout, stderr) => {
        if (null !== err) {
            logger.color('red').bold().log('No git repository');
            
            return;
        }
    });

    exec(`git --git-dir ${gitRepo} branch -r`, (err, stdout, stderr) => {
        if (null !== err) {
            logger.color('red').bold().log('No git repository');
            
            return;
        }
        const remoteBranchs = formatBranchs(stdout);
        const localBranchs = [];
        fs.readdirSync(`${gitRepo}/refs/heads`).forEach(file => {
            localBranchs.push(file);
        });

        localBranchs.forEach(localBranchName => {
            if (!remoteBranchs.includes(`origin/${localBranchName}`)) {
                const deleteBranch = query(`Delete branch : ${localBranchName}`);
                if (deleteBranch) {
                    exec(`git --git-dir ${gitRepo} branch -D ${localBranchName}`, (err, stdout, stderr) => {
                        if (null !== err) {
                            logger.color('red').bold().log('Error deleting branch');
                        } else {
                            logger.color('green').bold().log(`Deleted branch ${localBranchName}`);
                        }
                    });
                }
            }
        });
    });
}

function formatBranchs(rawString) {
    const formattedBranchs = [];
    rawString.split('\n').forEach(branchName => {
        if (branchName.length) {
            formattedBranchs.push(branchName.replace(/\s/g, ''));
        }
    });
    
    return formattedBranchs;
}
