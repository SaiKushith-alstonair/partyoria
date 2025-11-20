const { spawn } = require('child_process');

function startFrontend() {
    console.log('🚀 Starting PartyOria Frontend...');
    
    // Install dependencies if needed
    const install = spawn('npm', ['install'], { stdio: 'inherit', shell: true });
    
    install.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Dependencies installed');
            
            // Start dev server
            const dev = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true });
            
            dev.on('close', (code) => {
                console.log(`Frontend exited with code ${code}`);
            });
            
        } else {
            console.log('❌ Failed to install dependencies');
        }
    });
}

startFrontend();