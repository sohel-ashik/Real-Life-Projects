const os = require('os');
const fs = require('fs');
const { execSync, spawn } = require('child_process');
const path = require('path');

class LaptopDiagnostics {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            basicInfo: {},
            cpu: {},
            memory: {},
            storage: {},
            gpu: {},
            battery: {},
            display: {},
            network: {},
            thermal: {},
            performance: {},
            stressTest: {},
            recommendations: []
        };
    }

    // Basic System Information
    async getBasicInfo() {
        console.log('\n🔍 Gathering Basic System Information...');
        
        this.results.basicInfo = {
            platform: os.platform(),
            architecture: os.arch(),
            hostname: os.hostname(),
            uptime: Math.floor(os.uptime() / 3600), // hours
            osType: os.type(),
            osRelease: os.release(),
            osVersion: os.version(),
            totalMemory: (os.totalmem() / (1024**3)).toFixed(2) + ' GB',
            freeMemory: (os.freemem() / (1024**3)).toFixed(2) + ' GB'
        };

        console.log('✅ Basic info collected');
    }

    // CPU Analysis
    async getCPUInfo() {
        console.log('\n🔍 Analyzing CPU Performance...');
        
        const cpus = os.cpus();
        this.results.cpu = {
            model: cpus[0].model,
            cores: cpus.length,
            speed: cpus[0].speed + ' MHz',
            architecture: process.arch,
            loadAverage: os.loadavg(),
            usage: await this.getCPUUsage()
        };

        // CPU Stress Test
        await this.runCPUStressTest();
        console.log('✅ CPU analysis completed');
    }

    async getCPUUsage() {
        return new Promise((resolve) => {
            const startMeasure = process.cpuUsage();
            const startTime = Date.now();
            
            setTimeout(() => {
                const endMeasure = process.cpuUsage(startMeasure);
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                const userPercent = (endMeasure.user / 1000 / duration) * 100;
                const systemPercent = (endMeasure.system / 1000 / duration) * 100;
                
                resolve({
                    user: userPercent.toFixed(2) + '%',
                    system: systemPercent.toFixed(2) + '%',
                    total: (userPercent + systemPercent).toFixed(2) + '%'
                });
            }, 1000);
        });
    }

    async runCPUStressTest() {
        console.log('🔥 Running CPU stress test (10 seconds)...');
        
        const startTime = Date.now();
        const workers = [];
        const numCores = os.cpus().length;
        
        // Create CPU-intensive workers
        for (let i = 0; i < numCores; i++) {
            workers.push(this.cpuIntensiveTask());
        }
        
        // Monitor performance during stress
        const performanceData = [];
        const monitorInterval = setInterval(() => {
            performanceData.push({
                time: Date.now() - startTime,
                loadAvg: os.loadavg()[0],
                freeMem: os.freemem()
            });
        }, 1000);
        
        // Run stress test for 10 seconds
        await new Promise(resolve => setTimeout(resolve, 10000));
        clearInterval(monitorInterval);
        
        this.results.cpu.stressTest = {
            duration: '10 seconds',
            peakLoad: Math.max(...performanceData.map(d => d.loadAvg)).toFixed(2),
            avgLoad: (performanceData.reduce((sum, d) => sum + d.loadAvg, 0) / performanceData.length).toFixed(2),
            performanceData: performanceData
        };
    }

    cpuIntensiveTask() {
        return new Promise((resolve) => {
            const endTime = Date.now() + 10000; // 10 seconds
            
            const calculate = () => {
                let result = 0;
                for (let i = 0; i < 1000000; i++) {
                    result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
                }
                
                if (Date.now() < endTime) {
                    setImmediate(calculate);
                } else {
                    resolve(result);
                }
            };
            
            calculate();
        });
    }

    // Memory Analysis
    async getMemoryInfo() {
        console.log('\n🔍 Analyzing Memory (RAM)...');
        
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        
        this.results.memory = {
            total: (totalMem / (1024**3)).toFixed(2) + ' GB',
            used: (usedMem / (1024**3)).toFixed(2) + ' GB',
            free: (freeMem / (1024**3)).toFixed(2) + ' GB',
            usagePercentage: ((usedMem / totalMem) * 100).toFixed(2) + '%',
            details: process.memoryUsage()
        };

        // Memory stress test
        await this.runMemoryStressTest();
        console.log('✅ Memory analysis completed');
    }

    async runMemoryStressTest() {
        console.log('🔥 Running memory stress test...');
        
        const testArrays = [];
        const startFree = os.freemem();
        let allocated = 0;
        
        try {
            // Allocate memory in chunks until we use significant amount
            while (allocated < 1024 * 1024 * 1024 && testArrays.length < 100) { // 1GB limit
                const chunk = new Array(1024 * 1024).fill(Math.random());
                testArrays.push(chunk);
                allocated += chunk.length * 8; // 8 bytes per number
            }
            
            const endFree = os.freemem();
            
            this.results.memory.stressTest = {
                allocatedMB: (allocated / (1024 * 1024)).toFixed(2),
                memoryDrop: ((startFree - endFree) / (1024**2)).toFixed(2) + ' MB',
                chunks: testArrays.length
            };
            
        } catch (error) {
            this.results.memory.stressTest = {
                error: 'Memory allocation failed: ' + error.message,
                allocatedMB: (allocated / (1024 * 1024)).toFixed(2)
            };
        } finally {
            // Clean up
            testArrays.length = 0;
        }
    }

    // Storage Analysis
    async getStorageInfo() {
        console.log('\n🔍 Analyzing Storage...');
        
        try {
            let storageInfo = {};
            
            if (process.platform === 'win32') {
                storageInfo = await this.getWindowsStorageInfo();
            } else if (process.platform === 'darwin') {
                storageInfo = await this.getMacStorageInfo();
            } else {
                storageInfo = await this.getLinuxStorageInfo();
            }
            
            this.results.storage = storageInfo;
            
            // Storage speed test
            await this.runStorageSpeedTest();
            
        } catch (error) {
            this.results.storage = { error: error.message };
        }
        
        console.log('✅ Storage analysis completed');
    }

    async getWindowsStorageInfo() {
        try {
            const drives = execSync('wmic logicaldisk get size,freespace,caption,drivetype,filesystem', { encoding: 'utf8' });
            const diskInfo = execSync('wmic diskdrive get model,size,status,interfacetype', { encoding: 'utf8' });
            
            return {
                drives: drives,
                diskInfo: diskInfo,
                type: 'Windows Storage Analysis'
            };
        } catch (error) {
            return { error: 'Could not get Windows storage info: ' + error.message };
        }
    }

    async getMacStorageInfo() {
        try {
            const diskutil = execSync('diskutil list', { encoding: 'utf8' });
            const df = execSync('df -h', { encoding: 'utf8' });
            
            return {
                diskutil: diskutil,
                df: df,
                type: 'macOS Storage Analysis'
            };
        } catch (error) {
            return { error: 'Could not get macOS storage info: ' + error.message };
        }
    }

    async getLinuxStorageInfo() {
        try {
            const lsblk = execSync('lsblk -f', { encoding: 'utf8' });
            const df = execSync('df -h', { encoding: 'utf8' });
            const fdisk = execSync('sudo fdisk -l 2>/dev/null || fdisk -l 2>/dev/null || echo "No fdisk access"', { encoding: 'utf8' });
            
            return {
                lsblk: lsblk,
                df: df,
                fdisk: fdisk,
                type: 'Linux Storage Analysis'
            };
        } catch (error) {
            return { error: 'Could not get Linux storage info: ' + error.message };
        }
    }

    async runStorageSpeedTest() {
        console.log('🔥 Running storage speed test...');
        
        const testFile = path.join(__dirname, 'speed_test_file.tmp');
        const testData = Buffer.alloc(10 * 1024 * 1024, 'a'); // 10MB test file
        
        try {
            // Write speed test
            const writeStart = Date.now();
            fs.writeFileSync(testFile, testData);
            const writeTime = Date.now() - writeStart;
            
            // Read speed test
            const readStart = Date.now();
            const readData = fs.readFileSync(testFile);
            const readTime = Date.now() - readStart;
            
            this.results.storage.speedTest = {
                fileSize: '10 MB',
                writeSpeed: ((testData.length / (1024 * 1024)) / (writeTime / 1000)).toFixed(2) + ' MB/s',
                readSpeed: ((readData.length / (1024 * 1024)) / (readTime / 1000)).toFixed(2) + ' MB/s',
                writeTime: writeTime + ' ms',
                readTime: readTime + ' ms'
            };
            
            // Clean up
            fs.unlinkSync(testFile);
            
        } catch (error) {
            this.results.storage.speedTest = { error: error.message };
        }
    }

    // GPU Information
    async getGPUInfo() {
        console.log('\n🔍 Analyzing GPU...');
        
        try {
            let gpuInfo = {};
            
            if (process.platform === 'win32') {
                const gpu = execSync('wmic path win32_VideoController get name,adapterram,driverversion', { encoding: 'utf8' });
                gpuInfo = { windows: gpu };
            } else if (process.platform === 'darwin') {
                const gpu = execSync('system_profiler SPDisplaysDataType', { encoding: 'utf8' });
                gpuInfo = { macos: gpu };
            } else {
                try {
                    const lspci = execSync('lspci | grep -i vga', { encoding: 'utf8' });
                    const glxinfo = execSync('glxinfo | head -20 2>/dev/null || echo "glxinfo not available"', { encoding: 'utf8' });
                    gpuInfo = { linux: { lspci, glxinfo } };
                } catch (e) {
                    gpuInfo = { linux: { error: 'GPU info not accessible' } };
                }
            }
            
            this.results.gpu = gpuInfo;
            
        } catch (error) {
            this.results.gpu = { error: error.message };
        }
        
        console.log('✅ GPU analysis completed');
    }

    // Battery Information
    async getBatteryInfo() {
        console.log('\n🔍 Analyzing Battery...');
        
        try {
            let batteryInfo = {};
            
            if (process.platform === 'win32') {
                const battery = execSync('wmic path Win32_Battery get BatteryStatus,EstimatedChargeRemaining,EstimatedRunTime,DesignCapacity', { encoding: 'utf8' });
                batteryInfo = { windows: battery };
            } else if (process.platform === 'darwin') {
                const battery = execSync('pmset -g batt', { encoding: 'utf8' });
                const powerInfo = execSync('system_profiler SPPowerDataType', { encoding: 'utf8' });
                batteryInfo = { macos: { battery, powerInfo } };
            } else {
                try {
                    const acpi = execSync('acpi -b 2>/dev/null || echo "ACPI not available"', { encoding: 'utf8' });
                    const upower = execSync('upower -i /org/freedesktop/UPower/devices/battery_BAT0 2>/dev/null || upower -i $(upower -e | grep "BAT") 2>/dev/null || echo "UPower not available"', { encoding: 'utf8' });
                    batteryInfo = { linux: { acpi, upower } };
                } catch (e) {
                    batteryInfo = { linux: { error: 'Battery info not accessible' } };
                }
            }
            
            this.results.battery = batteryInfo;
            
        } catch (error) {
            this.results.battery = { error: error.message };
        }
        
        console.log('✅ Battery analysis completed');
    }

    // Display Information
    async getDisplayInfo() {
        console.log('\n🔍 Analyzing Display...');
        
        try {
            let displayInfo = {};
            
            if (process.platform === 'win32') {
                const display = execSync('wmic path Win32_VideoController get CurrentHorizontalResolution,CurrentVerticalResolution,MaxRefreshRate', { encoding: 'utf8' });
                displayInfo = { windows: display };
            } else if (process.platform === 'darwin') {
                const display = execSync('system_profiler SPDisplaysDataType', { encoding: 'utf8' });
                displayInfo = { macos: display };
            } else {
                try {
                    const xrandr = execSync('xrandr 2>/dev/null || echo "X11 not available"', { encoding: 'utf8' });
                    displayInfo = { linux: xrandr };
                } catch (e) {
                    displayInfo = { linux: { error: 'Display info not accessible' } };
                }
            }
            
            this.results.display = displayInfo;
            
        } catch (error) {
            this.results.display = { error: error.message };
        }
        
        console.log('✅ Display analysis completed');
    }

    // Network Information
    async getNetworkInfo() {
        console.log('\n🔍 Analyzing Network Interfaces...');
        
        const interfaces = os.networkInterfaces();
        this.results.network = {
            interfaces: Object.keys(interfaces).map(name => ({
                name: name,
                addresses: interfaces[name].filter(addr => !addr.internal)
            }))
        };
        
        console.log('✅ Network analysis completed');
    }

    // Temperature Monitoring (Linux/macOS)
    async getThermalInfo() {
        console.log('\n🔍 Checking Thermal Status...');
        
        try {
            let thermalInfo = {};
            
            if (process.platform === 'darwin') {
                // macOS temperature monitoring
                try {
                    const temp = execSync('sudo powermetrics -n 1 -s smc | grep -i temp || echo "Temperature monitoring requires sudo"', { encoding: 'utf8' });
                    thermalInfo = { macos: temp };
                } catch (e) {
                    thermalInfo = { macos: 'Temperature monitoring not available without sudo' };
                }
            } else if (process.platform === 'linux') {
                try {
                    const sensors = execSync('sensors 2>/dev/null || echo "lm-sensors not installed"', { encoding: 'utf8' });
                    const thermal = execSync('cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null || echo "Thermal zones not accessible"', { encoding: 'utf8' });
                    thermalInfo = { linux: { sensors, thermal } };
                } catch (e) {
                    thermalInfo = { linux: 'Thermal monitoring not accessible' };
                }
            } else {
                thermalInfo = { windows: 'Temperature monitoring requires additional tools on Windows' };
            }
            
            this.results.thermal = thermalInfo;
            
        } catch (error) {
            this.results.thermal = { error: error.message };
        }
        
        console.log('✅ Thermal analysis completed');
    }

    // Performance Analysis
    async getPerformanceMetrics() {
        console.log('\n🔍 Analyzing Overall Performance...');
        
        const startTime = Date.now();
        
        // Collect metrics over time
        const metrics = [];
        for (let i = 0; i < 5; i++) {
            metrics.push({
                timestamp: Date.now(),
                loadAvg: os.loadavg(),
                freeMem: os.freemem(),
                uptime: os.uptime()
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        this.results.performance = {
            duration: Date.now() - startTime,
            samples: metrics.length,
            avgLoad: (metrics.reduce((sum, m) => sum + m.loadAvg[0], 0) / metrics.length).toFixed(2),
            memoryStability: this.analyzeMemoryStability(metrics),
            loadStability: this.analyzeLoadStability(metrics)
        };
        
        console.log('✅ Performance analysis completed');
    }

    analyzeMemoryStability(metrics) {
        const memValues = metrics.map(m => m.freeMem);
        const variance = this.calculateVariance(memValues);
        return {
            variance: variance,
            stability: variance < 1000000000 ? 'Stable' : 'Unstable' // 1GB variance threshold
        };
    }

    analyzeLoadStability(metrics) {
        const loadValues = metrics.map(m => m.loadAvg[0]);
        const variance = this.calculateVariance(loadValues);
        return {
            variance: variance.toFixed(4),
            stability: variance < 0.5 ? 'Stable' : variance < 1.0 ? 'Moderate' : 'High Load'
        };
    }

    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    }

    // Generate Recommendations
    generateRecommendations() {
        console.log('\n🤔 Generating Recommendations...');
        
        const recommendations = [];
        
        // CPU recommendations
        if (this.results.cpu.cores < 4) {
            recommendations.push('❌ CPU has fewer than 4 cores - may struggle with modern multitasking');
        }
        
        // Memory recommendations
        const totalMemGB = parseFloat(this.results.memory.total);
        if (totalMemGB < 8) {
            recommendations.push('❌ Less than 8GB RAM - insufficient for modern computing needs');
        } else if (totalMemGB >= 16) {
            recommendations.push('✅ 16GB+ RAM - excellent for multitasking and demanding applications');
        }
        
        // Usage recommendations
        const memUsage = parseFloat(this.results.memory.usagePercentage);
        if (memUsage > 80) {
            recommendations.push('⚠️ High memory usage detected - system may be under stress');
        }
        
        // Storage recommendations
        if (this.results.storage.speedTest && this.results.storage.speedTest.writeSpeed) {
            const writeSpeed = parseFloat(this.results.storage.speedTest.writeSpeed);
            if (writeSpeed < 50) {
                recommendations.push('❌ Slow storage detected - consider SSD upgrade');
            } else if (writeSpeed > 200) {
                recommendations.push('✅ Fast storage detected - likely SSD');
            }
        }
        
        // Performance recommendations
        if (this.results.performance.avgLoad > 2) {
            recommendations.push('⚠️ High system load detected - system may be overloaded');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('✅ No major issues detected - laptop appears to be in good condition');
        }
        
        this.results.recommendations = recommendations;
        console.log('✅ Recommendations generated');
    }

    // Save Results
    saveResults() {
        const filename = `laptop_diagnostic_${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
        console.log(`\n💾 Results saved to: ${filename}`);
        return filename;
    }

    // Display Summary
    displaySummary() {
        console.log('\n' + '='.repeat(60));
        console.log('🔍 LAPTOP DIAGNOSTIC SUMMARY');
        console.log('='.repeat(60));
        
        console.log(`\n💻 System: ${this.results.basicInfo.osType} ${this.results.basicInfo.osRelease}`);
        console.log(`🔧 CPU: ${this.results.cpu.model} (${this.results.cpu.cores} cores)`);
        console.log(`💾 Memory: ${this.results.memory.total} (${this.results.memory.usagePercentage} used)`);
        
        if (this.results.storage.speedTest) {
            console.log(`💽 Storage Speed: Write ${this.results.storage.speedTest.writeSpeed}, Read ${this.results.storage.speedTest.readSpeed}`);
        }
        
        console.log(`⚡ Uptime: ${this.results.basicInfo.uptime} hours`);
        
        console.log('\n📋 RECOMMENDATIONS:');
        this.results.recommendations.forEach(rec => console.log(`  ${rec}`));
        
        console.log('\n' + '='.repeat(60));
    }

    // Main diagnostic function
    async runFullDiagnostic() {
        console.log('🚀 Starting Comprehensive Laptop Diagnostic...');
        console.log('This may take a few minutes...\n');
        
        try {
            await this.getBasicInfo();
            await this.getCPUInfo();
            await this.getMemoryInfo();
            await this.getStorageInfo();
            await this.getGPUInfo();
            await this.getBatteryInfo();
            await this.getDisplayInfo();
            await this.getNetworkInfo();
            await this.getThermalInfo();
            await this.getPerformanceMetrics();
            
            this.generateRecommendations();
            this.displaySummary();
            
            const filename = this.saveResults();
            
            console.log('\n✅ Diagnostic Complete!');
            console.log(`📊 Full results available in: ${filename}`);
            
        } catch (error) {
            console.error('❌ Diagnostic failed:', error.message);
        }
    }
}

// Usage
if (require.main === module) {
    const diagnostic = new LaptopDiagnostics();
    diagnostic.runFullDiagnostic();
}

module.exports = LaptopDiagnostics;
