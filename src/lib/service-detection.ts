// Service detection utility to check if Google services are available
export class ServiceDetection {
  private static checkedServices = new Set<string>();
  private static blockedServices = new Set<string>();

  static async checkGoogleServices(): Promise<{
    gsi: boolean;
    apis: boolean;
    firestore: boolean;
    blocked: string[];
  }> {
    const results = {
      gsi: false,
      apis: false,
      firestore: false,
      blocked: [] as string[]
    };

    // Check Google Sign-In
    try {
      const gsiResponse = await fetch('https://accounts.google.com/gsi/client', {
        mode: 'no-cors',
        cache: 'no-cache'
      });
      results.gsi = true;
      this.checkedServices.add('gsi');
    } catch (error) {
      results.blocked.push('Google Sign-In (accounts.google.com)');
      this.blockedServices.add('gsi');
    }

    // Check Google APIs
    try {
      const apiResponse = await fetch('https://apis.google.com/js/api.js', {
        mode: 'no-cors',
        cache: 'no-cache'
      });
      results.apis = true;
      this.checkedServices.add('apis');
    } catch (error) {
      results.blocked.push('Google APIs (apis.google.com)');
      this.blockedServices.add('apis');
    }

    // Check Firestore
    try {
      const firestoreResponse = await fetch('https://firestore.googleapis.com/', {
        mode: 'no-cors',
        cache: 'no-cache'
      });
      results.firestore = true;
      this.checkedServices.add('firestore');
    } catch (error) {
      results.blocked.push('Firebase Firestore (firestore.googleapis.com)');
      this.blockedServices.add('firestore');
    }

    return results;
  }

  static async detectAdBlocker(): Promise<boolean> {
    try {
      // Try to load a common ad blocker test
      const testDiv = document.createElement('div');
      testDiv.innerHTML = '&nbsp;';
      testDiv.className = 'adsbox';
      testDiv.style.position = 'absolute';
      testDiv.style.left = '-10000px';
      document.body.appendChild(testDiv);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const isBlocked = testDiv.offsetHeight === 0;
      document.body.removeChild(testDiv);
      
      return isBlocked;
    } catch (error) {
      return false;
    }
  }

  static getBlockedServicesList(): string[] {
    return Array.from(this.blockedServices);
  }

  static hasBlockedServices(): boolean {
    return this.blockedServices.size > 0;
  }

  static showServiceBlockedWarning(services: string[]): void {
    console.group('🚫 BLOCKED SERVICES DETECTED');
    console.warn('The following services are blocked by your browser or ad blocker:');
    services.forEach(service => console.warn(`❌ ${service}`));
    console.log('');
    console.log('✅ To fix this:');
    console.log('1. Disable ad blocker for wizxp.com');
    console.log('2. Add *.googleapis.com to whitelist');
    console.log('3. Add *.google.com to whitelist');
    console.log('4. Refresh the page');
    console.groupEnd();
  }
}