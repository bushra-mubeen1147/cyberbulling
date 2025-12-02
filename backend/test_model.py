# Test your model integration
# Run this file: python backend/test_model.py

from utils.classifier import classify_text
import sys
import json

def test_model():
    """Test the integrated model with various inputs"""
    
    print("="*60)
    print("CYBERBULLYING MODEL INTEGRATION TEST")
    print("="*60)
    
    # Test cases with expected behavior
    test_cases = [
        {
            "text": "You're such an idiot, nobody likes you!",
            "expected": "High toxicity (>0.6)",
            "type": "Toxic/Cyberbullying"
        },
        {
            "text": "Have a wonderful day! You're amazing!",
            "expected": "Low toxicity (<0.3)",
            "type": "Positive"
        },
        {
            "text": "The weather is nice today.",
            "expected": "Low toxicity (<0.3)",
            "type": "Neutral"
        },
        {
            "text": "Oh yeah, brilliant idea. Really smart.",
            "expected": "Possible sarcasm detected",
            "type": "Sarcasm"
        },
        {
            "text": "You're ugly and stupid, go kill yourself!",
            "expected": "Very high toxicity (>0.8)",
            "type": "Severe Cyberbullying"
        },
        {
            "text": "I appreciate your help, thank you so much!",
            "expected": "Low toxicity, positive sentiment",
            "type": "Gratitude"
        }
    ]
    
    passed = 0
    failed = 0
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n{'-'*60}")
        print(f"Test {i}/{len(test_cases)}: {test['type']}")
        print(f"{'-'*60}")
        print(f"Input: {test['text']}")
        print(f"Expected: {test['expected']}")
        
        try:
            result = classify_text(test['text'])
            
            print(f"\nResults:")
            print(f"  ├─ Toxicity Score: {result['toxicity_score']}")
            print(f"  ├─ Cyberbullying Prob: {result['cyberbullying_prob']}")
            print(f"  ├─ Sentiment: {result['sentiment']}")
            print(f"  └─ Sarcasm: {result['sarcasm']}")
            
            # Validation
            toxicity = result['toxicity_score']
            
            # Check if result makes sense
            valid = True
            if test['type'] in ['Toxic/Cyberbullying', 'Severe Cyberbullying']:
                if toxicity < 0.5:
                    print(f"\n⚠️  WARNING: Expected high toxicity but got {toxicity}")
                    valid = False
            elif test['type'] in ['Positive', 'Neutral', 'Gratitude']:
                if toxicity > 0.5:
                    print(f"\n⚠️  WARNING: Expected low toxicity but got {toxicity}")
                    valid = False
            
            if valid:
                print(f"\n✓ PASSED")
                passed += 1
            else:
                print(f"\n✗ FAILED")
                failed += 1
                
        except Exception as e:
            print(f"\n✗ ERROR: {str(e)}")
            print(f"Stack trace: {sys.exc_info()}")
            failed += 1
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Total Tests: {len(test_cases)}")
    print(f"Passed: {passed} ✓")
    print(f"Failed: {failed} ✗")
    print(f"Success Rate: {(passed/len(test_cases)*100):.1f}%")
    print("="*60)
    
    if failed == 0:
        print("\n🎉 All tests passed! Model integration successful!")
    else:
        print(f"\n⚠️  {failed} test(s) failed. Review model predictions.")
    
    return passed == len(test_cases)

def test_api_format():
    """Test that the output format matches API requirements"""
    
    print("\n" + "="*60)
    print("API FORMAT VALIDATION")
    print("="*60)
    
    text = "Test message"
    result = classify_text(text)
    
    required_fields = ['toxicity_score', 'cyberbullying_prob', 'sentiment', 'sarcasm']
    
    print(f"\nChecking output format...")
    all_present = True
    
    for field in required_fields:
        if field in result:
            print(f"✓ {field}: {result[field]} ({type(result[field]).__name__})")
        else:
            print(f"✗ {field}: MISSING")
            all_present = False
    
    # Type checking
    if all_present:
        if isinstance(result['toxicity_score'], (int, float)):
            print("✓ toxicity_score is numeric")
        else:
            print("✗ toxicity_score should be numeric")
            all_present = False
            
        if isinstance(result['cyberbullying_prob'], (int, float)):
            print("✓ cyberbullying_prob is numeric")
        else:
            print("✗ cyberbullying_prob should be numeric")
            all_present = False
            
        if isinstance(result['sarcasm'], bool):
            print("✓ sarcasm is boolean")
        else:
            print("✗ sarcasm should be boolean")
            all_present = False
            
        if isinstance(result['sentiment'], str):
            print("✓ sentiment is string")
        else:
            print("✗ sentiment should be string")
            all_present = False
    
    print("\n" + "="*60)
    if all_present:
        print("✓ API format validation PASSED")
    else:
        print("✗ API format validation FAILED")
    print("="*60)
    
    return all_present

if __name__ == "__main__":
    print("\n")
    print("╔" + "═"*58 + "╗")
    print("║" + " "*15 + "MODEL INTEGRATION TEST SUITE" + " "*15 + "║")
    print("╚" + "═"*58 + "╝")
    
    # Run tests
    format_ok = test_api_format()
    tests_ok = test_model()
    
    # Final result
    print("\n" + "="*60)
    if format_ok and tests_ok:
        print("✓ ALL CHECKS PASSED - Model ready for integration!")
        sys.exit(0)
    else:
        print("✗ SOME CHECKS FAILED - Review and fix issues above")
        sys.exit(1)
