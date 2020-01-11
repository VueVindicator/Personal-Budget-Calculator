var budgetController = (function(){
	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1
	}

	Expense.prototype.calPercentage = function(totalIncome){
		if(totalIncome > 0){
			this.percentage = (Math.round(this.value / totalIncome * 100)); 
		}else{
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	}

	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	}

	
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	}

	var calculateTotal = function(type){
		var sum;

		sum = 0;
		data.allItems[type].forEach(function(current){
			sum += current.value;
		});

		data.totals[type] = sum;
	}

	return {
		addItem: function(type, des, val){
			var newItem, ID;

			//create new ID
			if(data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}else{
				ID = 0;
			}
			
			//create new item based on 'inc' or 'exp'
			newItem = type === 'exp' ? new Expense(ID, des, val) : new Income(ID, des, val);
			
			//push it onto our data structure
			data.allItems[type].push(newItem);

			//return newItem
			return newItem;
		},

		deleteItem : function(type, id){
			var ids, index;
			ids = data.allItems[type].map(function(current){
				return current.id;
			});
			index = ids.indexOf(id);

			if(index !== -1){
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function(){
			//calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');
			//calculate the budjet: income - expenses
			data.budget = data.totals.inc - data.totals.exp;
			//calculate the percentage of income spent
			if(data.totals.inc > 0){
				data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
			}else{
				data.percentage = -1;
			}
		},

		calculatePercentages : function(){
			data.allItems.exp.forEach(function(current){
				current.calPercentage(data.totals.inc);
			})
		},

		getPercentages : function(){
			var allPerc = data.allItems.exp.map(function(current){
				return current.getPercentage();
			});
			return allPerc;
		},

		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage 
			}
		},

		testing: function(){
			console.log(data);
		}
	}
})();

var UIController = (function(){
	var DOMStrings = {
		inputType: '.add__type',
		descriptionType: '.add__description',
		valueType: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeValue: '.budget__income--value',
		expensesValue: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	}

	var formatNumber = function(num, type){
		var num, num_split, int, dec;
		num = Math.abs(num);
		num = num.toFixed(2);
		num_split = num.split('.');
		int = num_split[0];
		console.log(num_split);
		if(int.length > 3){
			int = int.subStr(0, int.length-3) + ',' + int.subStr(int.length-3, int.length);
		}
		dec = num_split[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	}

	var fieldsArray = function(list, callback){
		for(var i = 0; i < list.length; i++){
			callback(list[i], i);
		}
	};

	return{
		getInput: function(){
			return{
				type : document.querySelector(DOMStrings.inputType).value,
			    description : document.querySelector(DOMStrings.descriptionType).value,
			    value : parseFloat(document.querySelector(DOMStrings.valueType).value),
			}
		},

		addListItem: function(obj, type){
			var html, newHtml, element, fields, fieldsArray, sign;
			//create html string with placeholder text

			if(type === 'inc'){
				element = DOMStrings.incomeContainer;
				sign = '+';
				html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}else if(type === 'exp'){
				element = DOMStrings.expensesContainer
				sign = '-';
				html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
		
			//replace pplaceholder text with actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			//insert the html into the dom
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem : function(selectorID){
			var element = document.getElementById(selectorID)
			element.parentNode.removeChild(element);
		},

		clearFields: function(){
			fields = document.querySelectorAll(DOMStrings.descriptionType + ', ' + DOMStrings.valueType);
			fieldsArray = Array.prototype.slice.call(fields);

			fieldsArray.forEach(function(current, index, array){
				current.value = "";
			});

			fieldsArray[0].focus();
		},

		displayBudget: function(obj){
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMStrings.incomeValue).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMStrings.expensesValue).textContent = formatNumber(obj.totalExp, 'exp');
			document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage;

			if(obj.percentage > 0){
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
			}else{
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages : function(percentages){
			var fields = document.querySelectorAll(DOMStrings.expensesLabel);

			fieldsArray(fields, function(current, index){
				if(percentages[index] > 0){
					current.textContent = percentages[index] + '%';
				}else{
					current.textContent = '---';
				}
			});
		},

		displayMonth : function(){
			var now, month, months, year;
			now  =  new Date();
			months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ', ' + year;
		},

		changeType : function(){
			var fields = document.querySelectorAll(
				DOMStrings.inputType + ',' +
				DOMStrings.descriptionType + ',' +
				DOMStrings.valueType
			);

			fieldsArray(fields, function(cur){
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
		},

		getDOMStrings: function(){
			return DOMStrings;
		}
	}
})();

var appController = (function(budgetCtrl, UICtrl){
	var setupEventListeners = function(){
		var DOM = UICtrl.getDOMStrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event){
			if(event.keyCode === 13 || event.which === 13){
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click',  ctrdeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
	};

	var updateBudget = function(){

		budgetCtrl.calculateBudget();

		var budget = budgetCtrl.getBudget();

		UICtrl.displayBudget(budget);
	}

	var updatePercentages = function(){
		budgetCtrl.calculatePercentages();
		var percentages = budgetCtrl.getPercentages();
		UICtrl.displayPercentages(percentages);
	}

	var ctrlAddItem = function(){
		var input, newItem;

		input = UICtrl.getInput();
		
		if(input.description !== "" && !isNaN(input.value) && input.value > 0){
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			UICtrl.addListItem(newItem, input.type);
			UICtrl.clearFields();
			updateBudget();
			updatePercentages();
		}
	}

	var ctrdeleteItem = function(event){
		var item_id, splitId;

		item_id = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if(item_id){
			splitId = item_id.split('-');
			type = splitId[0];
			type = type == 'income' ? 'inc' : 'exp';
			ID = parseInt(splitId[1]);

			budgetCtrl.deleteItem(type, ID);
			UICtrl.deleteListItem(item_id);
			updateBudget();
			updatePercentages();
		}
		
	}

	return{
		init: function(){
			console.log('Application has started');
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0
			});
			setupEventListeners();
		}
	}

})(budgetController, UIController);

appController.init();