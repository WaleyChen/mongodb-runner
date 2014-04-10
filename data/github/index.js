var Browser = require('zombie');

var browser = new Browser();
browser.visit('https://github.com/orgs/10gen/members', function (){
  var users = [],
    $ = browser.jQuery;

  $('.member-link').each(function(){
    users.push({
      _id: $(this).find('.member-username').text().replace(/\s+/g, '').replace(/\\n/, ''),
      name: $(this).find('.member-fullname').text()
    });
  });
  console.log('var github = db.getSiblingDB(\'github\'), users = github.users;\n' + users.map(function(r){
    return 'users.insert('+JSON.stringify(r)+')';
  }).join(';\n'));

  browser.visit('https://github.com/imlucas?tab=repositories', function(){
    var repos = [];

    $('.repolist-name a').each(function(){
      var a = $(this),
        repo = {
          _id: a.attr('href'),
          name: a.text().replace(/\s+/g, '').replace(/\\n/, ''),
          user_id: a.attr('href').split('/')[1]
        };

      repos.push(repo);
    });

    console.log('var github = db.getSiblingDB(\'github\'), repos = github.repos;\n' + repos.map(function(r){
      return 'repos.insert('+JSON.stringify(r)+')';
    }).join(';\n'));
  });
});

