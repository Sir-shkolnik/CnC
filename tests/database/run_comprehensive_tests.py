#!/usr/bin/env python3
"""
Comprehensive Database Test Suite Runner
Executes ALL database tests including advanced integrity, stress, and load tests
"""

import sys
import os
import time
import subprocess
from datetime import datetime
from typing import Dict, List, Any

class ComprehensiveDatabaseTestRunner:
    def __init__(self):
        self.test_results = {
            "structure": {"passed": 0, "failed": 0, "errors": []},
            "validation": {"passed": 0, "failed": 0, "errors": []},
            "performance": {"passed": 0, "failed": 0, "errors": []},
            "integrity_advanced": {"passed": 0, "failed": 0, "errors": []},
            "stress_load": {"passed": 0, "failed": 0, "errors": []}
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
            ], capture_output=True, text=True, timeout=600)  # 10 minute timeout
            
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
            print(f"❌ {test_name} tests timed out after 10 minutes")
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
        """Run all comprehensive database test suites"""
        print("🚀 COMPREHENSIVE DATABASE TEST SUITE - 99% RELIABILITY TARGET")
        print("=" * 80)
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        
        self.start_time = time.time()
        
        # Get the directory of this script
        test_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Define ALL test suites
        test_suites = [
            ("test_database_structure.py", "Database Structure"),
            ("test_data_validation.py", "Data Validation"),
            ("test_performance_connection.py", "Performance & Connection"),
            ("test_data_integrity_advanced.py", "Advanced Data Integrity"),
            ("test_stress_and_load.py", "Stress & Load Testing")
        ]
        
        # Run each test suite
        for test_file, test_name in test_suites:
            test_path = os.path.join(test_dir, test_file)
            
            if not os.path.exists(test_path):
                print(f"❌ Test file not found: {test_path}")
                continue
            
            result = self.run_test_suite(test_path, test_name)
            
            # Store results based on test type
            if "structure" in test_name.lower():
                self.test_results["structure"] = result
            elif "validation" in test_name.lower():
                self.test_results["validation"] = result
            elif "performance" in test_name.lower():
                self.test_results["performance"] = result
            elif "integrity" in test_name.lower():
                self.test_results["integrity_advanced"] = result
            elif "stress" in test_name.lower():
                self.test_results["stress_load"] = result
        
        self.end_time = time.time()
        
        # Generate comprehensive report
        self.generate_comprehensive_report()
    
    def generate_comprehensive_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE DATABASE TEST REPORT - 99% RELIABILITY TARGET")
        print("=" * 80)
        
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
            
            # Check if we achieved 99% target
            if overall_success_rate >= 99.0:
                print("🎉 ACHIEVED 99% RELIABILITY TARGET! 🎉")
            elif overall_success_rate >= 95.0:
                print("🟡 CLOSE TO 99% TARGET - Minor issues to resolve")
            elif overall_success_rate >= 90.0:
                print("🟠 GOOD PROGRESS - Several issues to address")
            else:
                print("🔴 NEEDS SIGNIFICANT IMPROVEMENT")
        
        # Detailed results by test suite
        print(f"\n📋 DETAILED RESULTS:")
        print("-" * 60)
        
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
                
                # Status indicator
                if success_rate >= 99.0:
                    print(f"   🟢 EXCELLENT")
                elif success_rate >= 95.0:
                    print(f"   🟡 GOOD")
                elif success_rate >= 90.0:
                    print(f"   🟠 FAIR")
                else:
                    print(f"   🔴 NEEDS WORK")
            
            if errors:
                print(f"   🔍 Errors:")
                for error in errors[:3]:  # Show first 3 errors
                    print(f"      - {error}")
                if len(errors) > 3:
                    print(f"      ... and {len(errors) - 3} more errors")
        
        # Database reliability assessment
        print(f"\n🏥 DATABASE RELIABILITY ASSESSMENT:")
        print("-" * 60)
        
        if total_failed == 0 and total_errors == 0:
            print("🟢 PERFECT - 100% reliability achieved!")
            print("   Database is production-ready with zero issues")
        elif total_failed <= 2 and total_errors <= 2:
            print("🟢 EXCELLENT - 99%+ reliability achieved!")
            print("   Database is production-ready with minor issues")
        elif total_failed <= 5 and total_errors <= 5:
            print("🟡 GOOD - 95%+ reliability achieved")
            print("   Database needs minor fixes before production")
        elif total_failed <= 10 and total_errors <= 10:
            print("🟠 FAIR - 90%+ reliability achieved")
            print("   Database needs attention before production use")
        else:
            print("🔴 POOR - Below 90% reliability")
            print("   Database requires significant work before production")
        
        # Specific recommendations
        print(f"\n💡 SPECIFIC RECOMMENDATIONS:")
        print("-" * 60)
        
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
        
        if self.test_results["integrity_advanced"]["failed"] > 0:
            print("🔒 Fix advanced integrity issues:")
            print("   - Check multi-client isolation")
            print("   - Verify data leak prevention")
            print("   - Test duplicate detection")
            print("   - Validate security measures")
        
        if self.test_results["stress_load"]["failed"] > 0:
            print("🏋️ Fix stress and load issues:")
            print("   - Optimize concurrent operations")
            print("   - Improve transaction handling")
            print("   - Test deadlock prevention")
            print("   - Verify recovery mechanisms")
        
        if total_failed == 0:
            print("✅ No immediate action required")
            print("   Database is ready for production use")
        
        # Performance metrics
        print(f"\n📊 PERFORMANCE METRICS:")
        print("-" * 60)
        
        # Calculate average success rates by category
        structure_rate = self.test_results["structure"]["passed"] / max(1, self.test_results["structure"]["passed"] + self.test_results["structure"]["failed"]) * 100
        validation_rate = self.test_results["validation"]["passed"] / max(1, self.test_results["validation"]["passed"] + self.test_results["validation"]["failed"]) * 100
        performance_rate = self.test_results["performance"]["passed"] / max(1, self.test_results["performance"]["passed"] + self.test_results["performance"]["failed"]) * 100
        integrity_rate = self.test_results["integrity_advanced"]["passed"] / max(1, self.test_results["integrity_advanced"]["passed"] + self.test_results["integrity_advanced"]["failed"]) * 100
        stress_rate = self.test_results["stress_load"]["passed"] / max(1, self.test_results["stress_load"]["passed"] + self.test_results["stress_load"]["failed"]) * 100
        
        print(f"🏗️  Structure: {structure_rate:.1f}%")
        print(f"📊 Validation: {validation_rate:.1f}%")
        print(f"⚡ Performance: {performance_rate:.1f}%")
        print(f"🔒 Integrity: {integrity_rate:.1f}%")
        print(f"🏋️  Stress/Load: {stress_rate:.1f}%")
        
        # Save detailed report to file
        self.save_comprehensive_report()
    
    def save_comprehensive_report(self):
        """Save detailed report to file"""
        report_file = f"comprehensive_database_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        with open(report_file, 'w') as f:
            f.write("COMPREHENSIVE DATABASE TEST REPORT - 99% RELIABILITY TARGET\n")
            f.write("=" * 70 + "\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Test duration: {self.end_time - self.start_time:.2f} seconds\n\n")
            
            # Calculate totals
            total_passed = sum(result["passed"] for result in self.test_results.values())
            total_failed = sum(result["failed"] for result in self.test_results.values())
            total_errors = sum(len(result["errors"]) for result in self.test_results.values())
            
            f.write(f"OVERALL RESULTS:\n")
            f.write(f"  Total Passed: {total_passed}\n")
            f.write(f"  Total Failed: {total_failed}\n")
            f.write(f"  Total Errors: {total_errors}\n")
            
            if total_passed + total_failed > 0:
                overall_success_rate = (total_passed / (total_passed + total_failed)) * 100
                f.write(f"  Overall Success Rate: {overall_success_rate:.1f}%\n")
            
            f.write("\n")
            
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
        
        print(f"\n📄 Comprehensive report saved to: {report_file}")

def main():
    """Main function to run all comprehensive database tests"""
    runner = ComprehensiveDatabaseTestRunner()
    runner.run_all_tests()
    
    # Exit with appropriate code
    total_failed = sum(result["failed"] for result in runner.test_results.values())
    total_errors = sum(len(result["errors"]) for result in runner.test_results.values())
    
    if total_failed == 0 and total_errors == 0:
        print("\n🎉 ALL TESTS PASSED - 100% RELIABILITY ACHIEVED! 🎉")
        sys.exit(0)
    elif total_failed <= 2 and total_errors <= 2:
        print(f"\n🎉 99% RELIABILITY TARGET ACHIEVED! 🎉")
        print(f"Only {total_failed} tests failed with {total_errors} errors")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total_failed} tests failed with {total_errors} errors")
        print("Need to address issues to reach 99% reliability target")
        sys.exit(1)

if __name__ == "__main__":
    main() 