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
    
    // function tìm giá trị value của ô nhập mật khẩu có id là password
    function getConfirmValue(){
        console.log('password: ' + document.querySelector('#password').value)
        return document.querySelector('#password').value;
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
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`
            }
        },
        confirmation : function(value){
                return value === getConfirmValue() ? undefined : 'Giá trị nhập vào không chính xác';
        },
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
                    rule = ruleInfo[0]
                }
                
                var ruleFunc = validatorRules[rule];
                
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
            input.oninput = function (e) {
                var formGroup1= getParent(e.target, '.form-group')
                formGroup1.classList.remove('invalid');
                var formMessage1 = formGroup1.querySelector('.form-message')
                formMessage1.innerText = '';
            } 
        }
        // function thực hiện validate
        function handleValidate(event){         
            var rules = formRules[event.target.name]
            var errorMessage; 

            // rules.forEach(element => {
                // errorMessage = element(event.target.value);
                // console.log(errorMessage)    
            // });

            // vòng for qua các funtion  validatorRules
            for (var i = 0; i < rules.length; ++i) {
                switch(event.target.type){
                    case 'radio':
                    case 'checkbox':
                        console.log(event.target)
                        console.log( formElement.querySelector(rule.selector + ':checked'))

                        errorMessage = rules[i](
                            formElement.querySelector(rule.selector + ':checked')
                        );
                        break;
                    default:
                        errorMessage = rules[i](event.target.value);
                }
                // nếu trong vòng rules[i] không phải là undefined
                if (errorMessage) {
                    break;
                }
            }

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
            return errorMessage;
        }
    }
    // xử lý hành vi khi submit form
    formElement.onsubmit = function(e)  {
        e.preventDefault();
        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = true;
        for (var input of inputs){
            var ruleInput = {
                target:  input
            }
            // truyền 1 object form có key là target, value là input vào hàm hanleValidate
            if(handleValidate( ruleInput)){
                // nếu 1 trong các thẻ input trả về khác undefined thì isValid sẽ fail
                isValid = false;
            }
        }
        // Khi không có lỗi thì submit form 
        if(isValid){
            if (typeof options.onSubmit === 'function') {
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
            }
            // Trường hợp submit với hành vi mặc định
            else {
                formElement.submit();
            }
        }
    }
}