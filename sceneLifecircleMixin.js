'use strict';

/*
 * SceneFocusMixin
 * Scene life Circle
 *
 * Cases:
 * onEnterance 		- Fired at "former to current"
 * onBackIn 		- Fired at "latter to current"
 * onWillFocus 		- Fired at "other to current",two cases above covered.
 * onDidFocus 		- Fired at current scene active(after animation).
 * onbackwardblur 	- Fired at "current will jump to latter"
 * onForwardBlur 	- Fired at "current will jump to former"
 * onWillBlur 		- Fired at "current will blur",two cases above covered.
 * onDidBlur 		- Fired at "current to others" animation done.Before this.componentDidUnmounte
 */


var SceneFocusMixin = {

	componentWillMount:function(){
		var { route, navigator, routeIndex } = this.props;
		var { navigationContext } = navigator;
		var { index } = route;

		if( !route || !navigator ) return;

		// if( navigator.didFocusAdded ) return;

		this._sceneDidfocusListener = (
			navigationContext.addListener('didfocus',( event ) => {


				var routeStack 		= 	navigator.getCurrentRoutes();
				var targetRoute 	= 	event.data.route;
				var targetIndex 	= 	route.index;
				var routeStackLength	= 	routeStack.length;

				/*
					Based on route & routeStack relationship.
					this.onEnterance 	: enter from former one.
					this.onBackIn 		: enter from latter one.
					this.onDidFocus 	: fired when active.
				*/


				if( targetRoute == route && routeStackLength - 1 == targetIndex ){
					// Focus from front view

					navigationContext.emit( 'didblur',{ route:routeStack[ routeStackLength - 2 ] } )
					this.onEnterance && this.onEnterance( event, navigator, route, targetIndex );
					this.onDidFocus && this.onDidFocus( event, navigator, route, targetIndex )
				}

				if( targetRoute == route && routeStackLength - 2 == targetIndex ){
					// Focus from after view

					this.onBackIn && this.onBackIn( event, navigator, route, targetIndex );
					this.onDidFocus && this.onDidFocus( event, navigator, route, targetIndex )
				}
			})
		)

		this._sceneWillfocusListener = (
			navigationContext.addListener('willfocus', ( event ) => {
				
				var routeStack 		= 	navigator.getCurrentRoutes();
				var targetRoute 	= 	event.data.route;
				var targetIndex 	= 	route.index;

				// var { targetIndex } = routeStack.filter( ( route, index ) => { if( route == targetRoute ){ return route.targetIndex = index } })
				var routeStackLength	= 	routeStack.length;

				if( route == targetRoute ){
					// Will focus this view 

					this.onWillFocus && this.onWillFocus();
				}

				/*
					Based on route & routeStack relationship.
					this.onBackwardBlur : Jump to other scene.Before animation.
					this.onForwardBlur 	: Back to other scene.Before animation.
					this.onWillBlur 	: Fired while leave current scene.
				*/

				if( route == routeStack[ routeStackLength - 1 ] && route != targetRoute ){

					if( targetRoute ==  routeStack[ routeStackLength -2 ]){
						// Will unmount

						this.onBackwardBlur && this.onBackwardBlur( event, navigator, route, targetIndex )

					} else {
						// Will blur this view

						this.onForwardBlur && this.onForwardBlur( event, navigator, route, targetIndex )
					}

					this.onWillBlur && this.onWillBlur();
				}
			})
		)

		this._sceneDidBlurListener = (
			navigationContext.addListener('didblur',( event ) => {

				var routeStack 		= 	navigator.getCurrentRoutes();
				var targetRoute 	= 	event.data.route;
				var targetIndex 	= 	route.index;

				if( route == targetRoute ){
					// will blur this view

					this.onDidBlur && this.onDidBlur( event, navigator, route, targetIndex );
				}

			})
		)
	},
	componentWillUnmount:function(){

		this._removeSceneListeners()

	},
	_removeSceneListeners:function(){

		this._sceneDidfocusListener && this._sceneDidfocusListener.remove();
		this._sceneWillfocusListener && this._sceneWillfocusListener.remove();
		this._sceneDidBlurListener && this._sceneDidBlurListener.remove();

	}
}

module.exports = SceneFocusMixin;