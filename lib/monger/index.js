module.exports = function (){
  // var self = this;

  // if(!stream.subscribers){
  //   stream.subscribers = {};

  //   stream.on('data', function(data){
  //     var ids = Object.keys(stream.subscribers);
  //     self.debug('pushing to ' + ids.length + ' subscribers');

  //     ids.map(function(id){
  //       stream.subscribers[id].emit(this.uri, data);
  //     });
  //   });
  //   self.debug('got initial connection');
  // }
  // stream.subscribers[socket.id] = socket;

  // function unsub(){
  //   if(stream.subscribers[socket.id]){
  //     self.debug('unsubscribing');
  //     delete stream.subscribers[socket.id];
  //   }
  // }

  // socket.on(this.uri + '/unsubscribe', unsub)
  //   .on('disconnect', unsub);
  // return this;
};
