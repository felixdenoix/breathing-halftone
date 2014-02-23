( function( window ) {

'use strict';

// ----- vars ----- //

var TAU = Math.PI * 2;

function getNow() {
  return new Date();
}

// --------------------------  -------------------------- //

var Halftone = window.BreathingHalftone || {};
var Vector = Halftone.Vector;

// -------------------------- Particle -------------------------- //

function Particle( properties ) {
  this.channel = properties.channel;
  this.origin = properties.origin;
  this.parent = properties.parent;
  this.friction = properties.friction;
  this.position = Vector.copy( this.origin );
  this.naturalSize = properties.naturalSize;
  this.size = properties.naturalSize;
  // this.position.x += Math.random() * 100 - 50;
  // this.position.y += Math.random() * 100 - 50;
  this.velocity = new Vector();
  this.acceleration = new Vector();
  this.sizeVelocity = 0;

  // var center = new Vector( this.parent.width / 2, this.parent.height / 2 );
  // center.subtract( this.origin )
  // this.oscillationOffset = center.getMagnitude() / 50;
  this.oscillationOffset = Math.random() * TAU;
  this.oscillationMagnitude = Math.random();
}

Particle.prototype.applyForce = function( force ) {
  this.acceleration.add( force );
};

Particle.prototype.update = function() {
  this.applyOriginAttraction();

  // velocity
  this.velocity.add( this.acceleration );
  this.velocity.scale( 1 - this.friction );
  // position
  this.position.add( this.velocity );
  // reset acceleration
  this.acceleration.set( 0, 0 );
};

Particle.prototype.render = function( ctx, color ) {
  this.calculateSize( color );

  // oscillation size
  var now = getNow();
  var oscOpts = this.parent.options.dotSizeOsc;
  var oscSize = (now / (1000 * oscOpts.period)) * TAU;
  oscSize = Math.cos( oscSize + this.oscillationOffset );
  oscSize *= this.naturalSize * this.oscillationMagnitude * oscOpts.delta;
  var size = Math.abs( this.size ) + oscSize;

  ctx.beginPath();
  ctx.arc( this.position.x, this.position.y, Math.abs( size ), 0, TAU );
  ctx.fill();
  ctx.closePath();
};

Particle.prototype.calculateSize = function() {

  var targetSize = this.naturalSize * this.getChannelValue();

  var sizeAcceleration = (targetSize - this.size) * 0.3;
  this.sizeVelocity += sizeAcceleration;
  // friction
  this.sizeVelocity *= ( 1 - 0.3 );
  this.size += this.sizeVelocity;


  // this.size *= oscSize;

  // keep original size
  // this.size = this.naturalSize * this.getColorValue( this.origin, color );
};

Particle.prototype.getChannelValue = function() {
  var channelValue;
  // return origin channel value if not lens
  var position = this.parent.options.isChannelLens ? this.position : this.origin;
  if ( this.parent.options.isChannelLens ) {
    channelValue = this.parent.getPixelChannelValue( position.x, position.y, this.channel );
  } else {
    if ( !this.originChannelValue ) {
      this.originChannelValue = this.parent.getPixelChannelValue( position.x, position.y, this.channel );
    }
    channelValue = this.originChannelValue;
  }

  channelValue = channelValue || 0;
  if ( !this.parent.options.isAdditive ) {
    channelValue = 1 - channelValue;
  }
  return channelValue;
};

Particle.prototype.applyOriginAttraction = function() {
  var attraction = Vector.subtract( this.position, this.origin );
  attraction.scale( -0.02 );
  this.applyForce( attraction );
};

Halftone.Particle = Particle;

})( window );
