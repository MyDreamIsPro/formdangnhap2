function Validator(formSelector, options = {}){
    var formRules = {}

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var validatorRules = {
        required : function(value){
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email : function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập email'
        },
        min : function(min){
            return function(value){
                return value.length >= min ? undefined : `Vui lòng ít nhất ${min} kí tự`
            }
        }
    }
    // Lấy ra form element trong DOM theo formSelector
    var formElement = document.querySelector(formSelector);

    // Chỉ xử lý khi có element trong DOM theo formSelector
    if(formElement){
        var inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs){
            
            var rules = input.getAttribute('rules').split('|');
            for(var rule of rules){
                var ruleInfo;
                var isRuleHasValue = rule.includes(':')
                if(isRuleHasValue){
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }
                
                var ruleFunc = validatorRules[rule];
                // console.log(isRuleHasValue)
                // console.log(ruleFunc)

                if(isRuleHasValue){
                    ruleFunc = ruleFunc(ruleInfo[1])
                }

                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc)
                    
                }else{
                    formRules[input.name] = [ruleFunc]
                }
            }

            // formRules[input.name] = input.getAttribute('rules'))
            // lắng nghe sự kiện để onblur
            input.onblur = handleValidate;
        }
        // function thực hiện validate
        function handleValidate(event){
            var rules = formRules[event.target.name]
            var errorMessage; 

            rules.forEach(element => {
                errorMessage = element(event.target.value);
            });
            var formGroup = getParent(event.target, '.form-group')
            
            if (errorMessage) {
                // nếu nhập có lỗi 
                if (formGroup){
                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector('.form-message')
                    if (formMessage){
                        formMessage.innerText = errorMessage;
                    }
                }
            } else {
                // nếu nhập ko lỗi sẽ clear 
                if (formGroup){
                    formGroup.classList.remove('invalid');                    
                    var formMessage = formGroup.querySelector('.form-message')
                    if (formMessage){
                        formMessage.innerText = '';
                    }
                }
            }
            return !errorMessage;
        }
    }
    // xử lý hành vi khi submit form
    formElement.onsubmit = function(e)  {
        e.preventDefault();
        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = true;
        for (var input of inputs){
            if(handleValidate( {target: input})){
                isValid = false;
            }
        }
        // Khi không có lỗi thì submit form 
        if(isValid){
            if(typeof options.onSubmit === 'function'){
                var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }

                        return values;
                    }, {});
                options.onSubmit(formValues);
            }else{
                formElement.submit();
            }
        }
    }

    console.log(formRules)
}