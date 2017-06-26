/*!
 * BOMB RISK ELICITATION TASK (BRET) APP
 * 
 * @author Armin Pfurtscheller
 * @license MIT
 */

(function(angular){

	//
	// ANGULAR
	//

	// check if angular core is availble
	if( typeof angular === 'undefined' )
	{
		throw Error('Cannot initialize bomb task without angular!');
		return;
	}

	//
	// MODULE
	//

	// initialize angular module for app
	var app = angular.module('bombTask',[]);

	//
	// CONSTANTS
	//
	app.constant('DEFAULT_NUM_ROWS',7);
	app.constant('DEFAULT_NUM_COLS',7);
	app.constant('DEFAULT_WIDTH','50px');
	app.constant('DEFAULT_HEIGHT','50px');
	app.constant('DEFAULT_FEEDBACK',true);
	app.constant('DEFAULT_UNDOABLE',true);
	app.constant('DEFAULT_RANDOM',false);
	app.constant('DEFAULT_DYNAMIC',false);
	app.constant('DEFAULT_INTERVAL',1);
	app.constant('DEFAULT_RESET',false);
	app.constant('DEFAULT_INPUT',false);

	//
	// CONTROLLER
	//

	/**
	 * @constructor
	 */
	var BombTaskController = function($scope,$filter,$interval,$injector)
		{
			this._storageKey = 'bret_state';

			this.$injector = $injector;
			this.$interval = $interval;
			this.$filter = $filter;
			this.$scope = $scope;

			this.init();
		};

	/**
	 * @property {Array.<String>} $inject
	 */
	BombTaskController.$inject = ['$scope','$filter','$interval','$injector'];

	/**
	 * Initializes matrix array and random bomb.
	 * @return {Void}
	 */
	BombTaskController.prototype.init = function()
		{
			// init internal members
			this._initSettings();
			this._initMembers();
			this._initWatches();
			this._initMatrix();
			this._initBomb();
			this._initForm();

			// check if resetting
			// or restore state!
			if( this.reset )
				this._removeState();
			else
				this._desist();

			// start automatically
			// if not dynamic mode
			if( !this.dynamic )
				this.start();
		};

	/**
	 * Resets BRET for new rounds.
	 * @return {Void}
	 */
	BombTaskController.prototype.reset = function()
		{
			// unset watches and storage
			this._collectionUnwatchF();
			this._bombUnwatchF();
			this._removeState();

			// reinitialize
			this.init();
		};

	/**
	 * Starts current BRET round.
	 * @return {Void}
	 */
	BombTaskController.prototype.start = function(index)
		{
			// automatically resolve cards
			// by given time interval, so
			// by random order or rows
			if( this.dynamic )
			{				
				var me = this, 
					max = this.iterator.length;

				this._intIndex = index || 0;
				this._intervalId = me.$interval(
					function(){

						var item = me.iterator[me._intIndex];
						me.update(item,true);

						me._intIndex++;
						if( me._intIndex===max )
							me.stop();

					},
					this.interval*1000, // = from seconds
					max - this._intIndex // = max iterations
				);
			}

			this.started = true;
			this._persist();
		};

	/**
	 * Stops current BRET round.
	 * @return {Void}
	 */
	BombTaskController.prototype.stop = function()
		{
			if( this.dynamic && this._intervalId )
				this.$interval.cancel(this._intervalId);
			
			if( !this.feedback ) // @see: template!
				this.resolved = true;

			this.stopped = true;
			this._persist();
		};

	/**
	 * Reveals all cards in current collection.
	 * @return {Void}
	 */
	BombTaskController.prototype.resolve = function()
		{
			for( var i=0; i<this.collection.length; i++ )
				this.collection[i].$$resolved = true;

			this.resolved = true;
			this._persist();
		};

	/**
	 * Updates internal cards collection stack.
	 * @return {Void}
	 */
	BombTaskController.prototype.update = function(column,active)
		{
			var index = this.collection.indexOf(column);

			if( active )
			{
				if( index<0 )
					this.collection.push(column);
				
				column.$$active = true;
			}
			else
			{
				if( index>=0 )
				{
					this.collection.splice(index,1);
					column.$$active = false;
				}
			}

			this._persist();
		};

	/**
	 * Selects/Deselects boxes upon changes of input field.
	 * @return {Void}
	 */
	BombTaskController.prototype.select = function()
		{
			if( this.input_value === undefined ) // invalid
				this.input_value = this.getTotalBoxes();

			for( var i=0; i<this.iterator.length;i++ )
			{
				var state = (this.input_value-1)>=i;
				this.update(this.iterator[i],state);
			}
		};

	/**
	 * Checks if this column equals current bomb.
	 * @param {Object} column The column to check.
	 * @return {Boolean}
	 */
	BombTaskController.prototype.isBomb = function(column)
		{
			return angular.equals(this.bomb,column);
		};

	/**
	 * Checks if bomb is contained in collection.
	 * @return {Integer}
	 */
	BombTaskController.prototype.hasBomb = function()
		{
			var me = this,
				filtered = this.$filter('filter')(
					this.collection,
					function(column)
					{
						return me.isBomb(column);
					}
				);

			return +(filtered.length === 1);
		};

	/**
	 * Returns number of total boxes.
	 * @return {Integer}
	 */
	BombTaskController.prototype.getTotalBoxes = function()
		{
			return this.rows * this.cols;
		};

	/**
	 * Returns number of collected boxes.
	 * @return {Integer}
	 */
	BombTaskController.prototype.getCollectedBoxes = function()
		{
			return this.collection.length;
		};

	/**
	 * Returns number of remaining boxes.
	 * @return {Integer}
	 */
	BombTaskController.prototype.getRemainingBoxes = function()
		{
			return this.getTotalBoxes() - this.getCollectedBoxes();
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._getConstant = function(name)
		{
			if( this.$injector.has(name) )
				return this.$injector.get(name);

			return this.$injector.get('DEFAULT_' + name);
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._getColumn = function(data)
		{
			// for data-binding!
			var row = data.row-1,
				col = data.col-1;

			return this.matrix[row][col];
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._getState = function()
		{
			if( typeof sessionStorage !== "undefined" )
				return angular.fromJson(sessionStorage.getItem(this._storageKey));

			return null;
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._setState = function(data)
		{
			if( typeof sessionStorage !== "undefined" )
				sessionStorage.setItem(this._storageKey,angular.toJson(data));
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._removeState = function()
		{
			if( typeof sessionStorage !== "undefined" )
				sessionStorage.removeItem(this._storageKey);
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._persist = function()
		{
			var state = {
				bomb: this.bomb,
				started: this.started,
				stopped: this.stopped,
				resolved: this.resolved,
				collection: this.collection,
				input_value: this.input_value
			};

			if( this.dynamic )
			{
				state.iterator = this.iterator;
				state._intIndex = this._intIndex;
			}

			this._setState(state);
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._desist = function()
		{
			var state = this._getState();
			if( state === null )
				return;

			this.input_value = state.input_value;
			this.bomb = this._getColumn(state.bomb);

			if( state.iterator )
			{
				this.iterator = [];
				for( var i=0;i<state.iterator.length;i++ )
				{
					var column = this._getColumn(
						state.iterator[i]
					);
					
					this.iterator.push(column);
				}
			}

			for( var i=0;i<state.collection.length;i++ )
			{
				var column = this._getColumn(
					state.collection[i]
				);

				this.update(column,true);
			}

			if( state.started )
				this.start(state._intIndex);

			if( state.stopped )
				this.stop();

			if( state.resolved )
				this.resolve();
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._initSettings = function()
		{
			this.reset = this._getConstant('RESET');

			this.width = this._getConstant('WIDTH');
			this.height = this._getConstant('HEIGHT');
			
			this.rows = this._getConstant('NUM_ROWS');
			this.cols = this._getConstant('NUM_COLS');

			this.random = this._getConstant('RANDOM');
			this.dynamic = this._getConstant('DYNAMIC');
			this.interval = this._getConstant('INTERVAL');

			this.feedback = this._getConstant('FEEDBACK');
			this.undoable = this._getConstant('UNDOABLE');

			this.input = this._getConstant('INPUT');
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._initMembers = function()
		{
			this.collection = [];			
			this.started = false;
			this.stopped = false;
			this.resolved = false;
			
			this.input_value = 0;
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._initWatches = function()
		{
			var me = this;
			this._collectionUnwatchF = this.$scope.$watchCollection(
				function(){ return me.collection; },
				function(collection){
					me.form.boxes_collected = collection.length;
					me.form.boxes_scheme = angular.toJson(collection);
				}
			);

			this._bombUnwatchF = this.$scope.$watch(
				function(){ return me.hasBomb(); },
				function(hasBomb){
					me.form.bomb = hasBomb;
					me.form.bomb_row = me.bomb.row;
					me.form.bomb_col = me.bomb.col;
				}
			);
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._initMatrix = function()
		{
			this.matrix = [];
			this.iterator = [];

			for( var i=0; i<this.rows; i++ )
			{
				var columns = [];
				for( var j=0; j<this.cols; j++ )
				{
					var data = { 
						row: i+1, 
						col: j+1 
					};

					columns.push(data);

					if( this.dynamic || this.input )
					{
						if( !this.random )
							this.iterator.push(data);
						else
							this._pushRandom(this.iterator,data);
					}
				}

				this.matrix.push(columns);
			}
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._initBomb = function()
		{
			var row = this._getRandom(0,this.rows-1),
				col = this._getRandom(0,this.cols-1);

			this.bomb = this.matrix[row][col];
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._initForm = function()
		{
			this.form = {
				bomb: 0,
		 		boxes_scheme: [],
		 		boxes_collected: 0,
		 		bomb_row: null,
				bomb_col: null
			};
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._getRandom = function(min,max)
		{
			return Math.floor(Math.random() * (max-min+1) + min);
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._pushRandom = function(array,value)
		{
			// Inside-Out Shuffle Algorithm
			var rand = this._getRandom(0,array.length);
			array.push(array[rand]);
			array[rand] = value;

			return array.length;
		};

	/**
	 * @ignore
	 */
	BombTaskController.prototype._shuffleArray = function(array)
		{
			// Fisher-Yates Shuffle Algorithm
			for( var i=array.length-1; i>0; i-- )
			{
				var rand = this._getRandom(0,i),
		       		temp = array[i];

		        array[i] = array[rand];
		        array[rand] = temp;
		    }

    		return array;
		};

	// register the controller for app
	app.controller('BombTaskController',BombTaskController);

	//
	// COMPONENT
	//

	/**
	 * @constructor
	 */
	var CardController = function(){};

	/**
	 * @var {Objet} model Card's model to write.
	 */
	CardController.prototype.model = null;

	/**
	 *


	/**
	 * @var {Boolean} isActive Current activity state.
	 */
	CardController.prototype.isActive = false;

	/**
	 * @var {Boolean} isDisabled Current disabled state.
	 */
	CardController.prototype.isDisabled = false;

	/**
	 * @var {Boolean} isClickable Cards clickability.
	 */
	CardController.prototype.isClickable = true;
	
	/**
	 * Toggles card's current activity state.
	 * @return {Void}
	 */
	CardController.prototype.toggle = function()
		{
			if( this.isDisabled || !this.isClickable )
				return;

			this.isActive = !this.isActive;
			this.onToggle({model:this.model,state:this.isActive});
		};

	// register the controller for app
	app.directive('card',function(){

		return {
			scope: {
				model:'=card',
				onToggle:'&cardOnToggle',
				isActive:'=?cardIsActive',
				isDisabled:'=?cardIsDisabled',
				isClickable:'=?cardIsClickable'
			},
			restrict: 'A',
			transclude: true,
			bindToController: true,
			templateUrl: '/card.html',
			controller: CardController,
			controllerAs: 'cardController'
		};

	});
	

})(angular);