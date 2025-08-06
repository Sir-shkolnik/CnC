#!/usr/bin/env python3
"""
Comprehensive Database Test Suite Runner
Executes all database tests and provides detailed reporting
"""

import sys
import os
import time
import subprocess
from datetime import datetime
from typing import Dict, List, Any

class DatabaseTestRunner:
    def __init__(self):
        self.test_results = {
            "structure": {"passed": 0, "failed": 0, "errors": []},
            "validation": {"passed": 0, "failed": 0, "errors": []},
            "performance": {"passed": 0, "failed": 0, "errors": []}
        }
        self.start_time = None
        self.end_time = None
    
    def run_test_suite(self, test_file: str, test_name: str) -> Dict[str, Any]:
        """Run a specific test suite"""
        print(f"\n{'='*20} {test_name.upper()} TESTS {'='*20}")
        
        try:
            # Run the test file
            result = subprocess.run([
                sys.executable, test_file
            ], capture_output=True, text=True, timeout=300)  # 5 minute timeout
            
            # Parse output to extract results
            output = result.stdout
            error_output = result.stderr
            
            # Look for test summary in output
            passed = 0
            failed = 0
            errors = []
            
            for line in output.split('\n'):
                if "✅ Passed:" in line:
                    try:
                        passed = int(line.split("✅ Passed:")[1].strip())
                    except:
                        pass
                elif "❌ Failed:" in line:
                    try:
                        failed = int(line.split("❌ Failed:")[1].strip())
                    except:
                        pass
                elif "💥 ERROR" in line:
                    errors.append(line.strip())
            
            # Print test output
            print(output)
            if error_output:
                print("STDERR:", error_output)
            
            return {
                "passed": passed,
                "failed": failed,
                "errors": errors,
                "return_code": result.returncode,
                "output": output
            }
            
        except subprocess.TimeoutExpired:
            print(f"❌ {test_name} tests timed out after 5 minutes")
            return {
                "passed": 0,
                "failed": 1,
                "errors": ["Test suite timed out"],
                "return_code": 1,
                "output": "TIMEOUT"
            }
        except Exception as e:
            print(f"❌ Error running {test_name} tests: {e}")
            return {
                "passed": 0,
                "failed": 1,
                "errors": [str(e)],
                "return_code": 1,
                "output": str(e)
            }
    
    def run_all_tests(self):
        """Run all database test suites"""
        print("🚀 COMPREHENSIVE DATABASE TEST SUITE")
        print("=" * 60)
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        self.start_time = time.time()
        
        # Get the directory of this script
        test_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Define test suites
        test_suites = [
            ("test_database_structure.py", "Database Structure"),
            ("test_data_validation.py", "Data Validation"),
            ("test_performance_connection.py", "Performance & Connection")
        ]
        
        # Run each test suite
        for test_file, test_name in test_suites:
            test_path = os.path.join(test_dir, test_file)
            
            if not os.path.exists(test_path):
                print(f"❌ Test file not found: {test_path}")
                continue
            
            result = self.run_test_suite(test_path, test_name)
            
            # Store results
            if "structure" in test_name.lower():
                self.test_results["structure"] = result
            elif "validation" in test_name.lower():
                self.test_results["validation"] = result
            elif "performance" in test_name.lower():
                self.test_results["performance"] = result
        
        self.end_time = time.time()
        
        # Generate comprehensive report
        self.generate_report()
    
    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 60)
        print("📊 COMPREHENSIVE DATABASE TEST REPORT")
        print("=" * 60)
        
        total_time = self.end_time - self.start_time
        print(f"Total test time: {total_time:.2f} seconds")
        print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Calculate totals
        total_passed = sum(result["passed"] for result in self.test_results.values())
        total_failed = sum(result["failed"] for result in self.test_results.values())
        total_errors = sum(len(result["errors"]) for result in self.test_results.values())
        
        print(f"\n📈 OVERALL RESULTS:")
        print(f"✅ Total Passed: {total_passed}")
        print(f"❌ Total Failed: {total_failed}")
        print(f"💥 Total Errors: {total_errors}")
        
        if total_passed + total_failed > 0:
            overall_success_rate = (total_passed / (total_passed + total_failed)) * 100
            print(f"🎯 Overall Success Rate: {overall_success_rate:.1f}%")
        
        # Detailed results by test suite
        print(f"\n📋 DETAILED RESULTS:")
        print("-" * 40)
        
        for suite_name, result in self.test_results.items():
            suite_display_name = suite_name.replace("_", " ").title()
            passed = result["passed"]
            failed = result["failed"]
            errors = result["errors"]
            
            print(f"\n🔍 {suite_display_name}:")
            print(f"   ✅ Passed: {passed}")
            print(f"   ❌ Failed: {failed}")
            print(f"   💥 Errors: {len(errors)}")
            
            if passed + failed > 0:
                success_rate = (passed / (passed + failed)) * 100
                print(f"   🎯 Success Rate: {success_rate:.1f}%")
            
            if errors:
                print(f"   🔍 Errors:")
                for error in errors[:3]:  # Show first 3 errors
                    print(f"      - {error}")
                if len(errors) > 3:
                    print(f"      ... and {len(errors) - 3} more errors")
        
        # Database health assessment
        print(f"\n🏥 DATABASE HEALTH ASSESSMENT:")
        print("-" * 40)
        
        if total_failed == 0 and total_errors == 0:
            print("🟢 EXCELLENT - All tests passed!")
            print("   Database is healthy and ready for production")
        elif total_failed <= 2 and total_errors <= 2:
            print("🟡 GOOD - Minor issues detected")
            print("   Database is mostly healthy with some minor issues")
        elif total_failed <= 5 and total_errors <= 5:
            print("🟠 FAIR - Several issues detected")
            print("   Database needs attention before production use")
        else:
            print("🔴 POOR - Multiple critical issues")
            print("   Database requires immediate attention")
        
        # Recommendations
        print(f"\n💡 RECOMMENDATIONS:")
        print("-" * 40)
        
        if self.test_results["structure"]["failed"] > 0:
            print("🔧 Fix database structure issues:")
            print("   - Check table schemas and relationships")
            print("   - Verify foreign key constraints")
            print("   - Ensure all required indexes exist")
        
        if self.test_results["validation"]["failed"] > 0:
            print("📊 Fix data validation issues:")
            print("   - Verify LGM data completeness")
            print("   - Check data relationships")
            print("   - Validate business rules")
        
        if self.test_results["performance"]["failed"] > 0:
            print("⚡ Fix performance issues:")
            print("   - Optimize slow queries")
            print("   - Add missing indexes")
            print("   - Check connection pooling")
        
        if total_failed == 0:
            print("✅ No immediate action required")
            print("   Database is ready for production use")
        
        # Save detailed report to file
        self.save_detailed_report()
    
    def save_detailed_report(self):
        """Save detailed report to file"""
        report_file = f"database_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        with open(report_file, 'w') as f:
            f.write("COMPREHENSIVE DATABASE TEST REPORT\n")
            f.write("=" * 50 + "\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Test duration: {self.end_time - self.start_time:.2f} seconds\n\n")
            
            for suite_name, result in self.test_results.items():
                f.write(f"{suite_name.upper()} TESTS:\n")
                f.write(f"  Passed: {result['passed']}\n")
                f.write(f"  Failed: {result['failed']}\n")
                f.write(f"  Errors: {len(result['errors'])}\n")
                if result['errors']:
                    f.write("  Error details:\n")
                    for error in result['errors']:
                        f.write(f"    - {error}\n")
                f.write("\n")
        
        print(f"\n📄 Detailed report saved to: {report_file}")

def main():
    """Main function to run all database tests"""
    runner = DatabaseTestRunner()
    runner.run_all_tests()
    
    # Exit with appropriate code
    total_failed = sum(result["failed"] for result in runner.test_results.values())
    total_errors = sum(len(result["errors"]) for result in runner.test_results.values())
    
    if total_failed == 0 and total_errors == 0:
        print("\n🎉 All database tests passed successfully!")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total_failed} tests failed with {total_errors} errors")
        sys.exit(1)

if __name__ == "__main__":
    main() 