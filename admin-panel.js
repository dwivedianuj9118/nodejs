var UserController = require('../api/controller/userController');
var SuperAdminController = require('../api/controller/superAdminController');
var CategoryController = require('../api/controller/categoryController');
var ContactController = require('../api/controller/contactController');
var JobController = require('../api/controller/jobController');
var SecurityQuesController = require('../api/controller/securityQuesController');
var LanguageController = require('../api/controller/languageController');
var CmsController = require('../api/controller/cmsController');
var WorkTypeController = require('../api/controller/workTypeController');
var ProductionHouseController = require('../api/controller/productionHouseController');
var DocumentController = require('../api/controller/documentController');
var AcademicTypeController = require('../api/controller/academicTypeController');

var ClaimController = require('../api/controller/claimController');

var ActivityController = require('../api/controller/activityController');
var PhysiqueController = require('../api/controller/physiqueController');
var ComplexionController = require('../api/controller/complexionController');
var EyeColorController = require('../api/controller/eyeColorController');
var HairColorController = require('../api/controller/hairColorController');
var HairLengthController = require('../api/controller/hairLengthController');
var InterestController = require('../api/controller/interestController');

var BannerController = require('../api/controller/bannerController');
var BlogController = require('../api/controller/blogController');
var PressController = require('../api/controller/pressController');

var MovieController = require('../api/controller/movie_controller');
var ShortFilmController = require('../api/controller/shortFilmController');
var TheatreController = require('../api/controller/theatreController');
var WebSeriesController = require('../api/controller/webSeriesController');
var CelebrityController = require('../api/controller/celebrityController');
var GalleryController = require('../api/controller/galleryController');

var NewsController = require('../api/controller/newsController');
var AwardController = require('../api/controller/awardController');

var MagazineController = require('../api/controller/magazineController');
var TvComController = require('../api/controller/tvComController');
var PrintMediaController = require('../api/controller/printMediaController');

var TvController = require('../api/controller/tvController');

var MusicController = require('../api/controller/musicController');

var SubscriptionController = require('../api/controller/subscriptionController');
var GenreController = require('../api/controller/genreController');
var ProfessionController = require('../api/controller/professionController');
var AssociationController = require('../api/controller/associationController');
var TestimonialController = require('../api/controller/testimonialController');
var DefaultController = require('../api/controller/defaultController');

var RoleController = require('../api/controller/roleController');
var ModuleController = require('../api/controller/moduleController');

var AdsController = require('../api/controller/adsController');
var MetaController = require('../api/controller/metaController');
var WebsiteController = require('../api/controller/websiteController');
var Celebrity = require('../api/models/celebrity');

var moment = require('moment-timezone');

var Service = require('../api/service');
var localization = require('../api/service/localization');

var config = require('../config');
var _ = require('lodash');

module.exports = function (router) {

	router.get('/', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			res.redirect('/admin/login');
		} else {
			res.redirect('/admin/dashboard');
		}
	});

	router.get('/admin/', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			res.redirect('/admin/login');
		} else {
			res.redirect('/admin/dashboard');
		}
	});

	router.get('/admin/dashboard', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var from_date = "";
		var to_date = "";

		if(req.query){
			if(req.query.from && req.query.to){
				// if(Service.valiDate(req.query.from) && Service.valiDate(req.query.to)) {
					if(Date.parse(req.query.to) >= Date.parse(req.query.from)){
						from_date = req.query.from;
						to_date = req.query.to;
					}
				// }
			}
		}
		console.log("FROM :",from_date);
		console.log("TO   :",to_date);

		var data = await SuperAdminController.getDashboardForDatesDE(req,from_date,to_date);
		var language = await SuperAdminController.getDashboardLanguage();
		var languageModule = await SuperAdminController.getDashboardLanguageModule();

		res.render('admin/dashboard', {
			'title': 'IFH',
			'type': 'dashboard-main',
			'sub': 'dashboard-main',
			'host': config.pre + req.headers.host,
			'data': data,
			'languages': language,
			'languageModule': languageModule,
			'admin': req.admin
		});
	});
	
	router.get('/admin/prime-dashboard', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			res.redirect('/admin/login');
		} else {

			var data = {};

			data.users = await UserController.getNewUsers();
			data.jobs = await JobController.getNewJobs();
			data.stats = await UserController.getStats();

			data.users_length = data.users.length;
			data.jobs_length = data.jobs.length;

			data.default_profile_pic = config.pre + req.headers.host + '/admin-assets/dist/img/dummy_image.png';

			res.render('admin/index', {
				'title': 'IFH',
				'type': 'dashboard',
				'sub': 'dashboard',
				'host': config.pre + req.headers.host,
				'data': data,
				'admin': req.admin
			});
		}
	});

	router.get('/admin/login', Service.authenticateAdmin, function (req, res) {
		console.log('here');
		
		if (!req.auth) {
			res.render('admin/login', {
				'host': config.pre + req.headers.host,
			});
		} else {
			res.redirect('/');
		}
	});

	router.get('/admin/users/all', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var users = await UserController.getAllUsers(0);

		res.render('admin/users', {
			'title': 'IFH',
			'type': 'users',
			'sub': 'all',
			'host': config.pre + req.headers.host,
			'users': users.list,
			'total': users.total,
			'type':0,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});
	
	router.get('/admin/users_get_ajax', Service.authenticateAdmin, async function (req, res) {
		return UserController.getUsersAjax(req, res);
	});

	router.get('/admin/users/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}


		var languages = await LanguageController.getListAdmin('a');
		var indian_languages = await LanguageController.getListAdmin('i');
		var foreign_languages = await LanguageController.getListAdmin('f');

		var physique = await PhysiqueController.getListAdmin();

		var activities = await ActivityController.getListAdmin();

		var complexions = await ComplexionController.getListAdmin();
		var eye_colors = await EyeColorController.getListAdmin();
		var hair_colors = await HairColorController.getListAdmin();
		var hair_lengths = await HairLengthController.getListAdmin();

		var project_types = await WorkTypeController.getListAdmin();
		var academic_types = await AcademicTypeController.getListAdmin();

		var supportObj = {
			'title': 'IFH',
			'type': 'users',
			'sub': 'all',
			'host': config.pre + req.headers.host,
			'user': {},
			'modelTab': false,
			'companyDetail': false,
			'writerDetail': false,
			'workTab': false,
			'equipmentTab': false,
			'propTab': false,
			'locationTab': false,
			'found': true,
			'admin': req.admin,
			languages,
			indian_languages,
			foreign_languages,
			physique,
			activities,
			complexions,
			eye_colors,
			hair_colors,
			hair_lengths,
			project_types,
			academic_types
		};

		var user = await UserController.getUser(req, req.params.id);

		if (user.sub_category_id == "5b4084f5b6d6f1d5f0402a7f") {
			supportObj.writerDetail = true;
		}

		var talentModelActor = ["5b40849eb6d6f1d5f040260a", "5b4084f4b6d6f1d5f0402a6b", "5b4084f4b6d6f1d5f0402a73", "5b4084f5b6d6f1d5f0402a77", "5b4084f5b6d6f1d5f0402a7c", "5b4084f5b6d6f1d5f0402a7f", "5b4084f5b6d6f1d5f0402a9d", "5b408585b6d6f1d5f04031ed", "5b408585b6d6f1d5f04031f0", "5b408565b6d6f1d5f040304f", "5b408464b6d6f1d5f040231c"];
		if (talentModelActor.indexOf(user.sub_category_id) > -1) {
			supportObj.modelTab = true;
		}
		if (talentModelActor.indexOf(user.sub_category_id) == -1) {
			supportObj.companyDetail = true;
		}
		var projectHolders = talentModelActor;
		projectHolders.push("5b4083a3b6d6f1d5f0401946");
		projectHolders.push("5b408408b6d6f1d5f0401e67");
		projectHolders.push("5b408409b6d6f1d5f0401e6f");
		projectHolders.push("5b408409b6d6f1d5f0401e71");
		projectHolders.push("5b408409b6d6f1d5f0401e73");
		projectHolders.push("5b40840ab6d6f1d5f0401e77");
		projectHolders.push("5b40837bb6d6f1d5f0401733");
		//Photographer, Producer/Client, Talent, Model/Actor

		if (projectHolders.indexOf(user.sub_category_id) > -1) {
			supportObj.workTab = true;
		}

		if (user.sub_category_id == "5b4c7837b6d6f1d5f0cbe783") {
			supportObj.propTab = true;
		}
		if (user.sub_category_id == "5b406692767c271b8c8623fe" || user.category == "5b40837ab6d6f1d5f040172c") {
			supportObj.equipmentTab = true;
		}
		if (user.sub_category_id == "5b40837bb6d6f1d5f0401731") {
			supportObj.locationTab = true;
		}


		supportObj.categories = await CategoryController.mainlistAdmin();

		if(Service.validateObjectId(user.sub_category_id)){
			var catData = await CategoryController.subListAdmin(user.sub_category_id);
			console.log("CATDATA",catData);
			supportObj.sub_categories = catData.sub_categories;
			supportObj.main_category_id = catData.main_category_id;
			supportObj.sub_category_id = catData.sub_category_id;
		}else{
			supportObj.sub_categories = [];
			supportObj.main_category_id = "";
			supportObj.sub_category_id = "";
		}

		//model || actor
		if(supportObj.sub_category_id.toString() === '5b408585b6d6f1d5f04031ed' && supportObj.sub_category_id.toString() === '5b408585b6d6f1d5f04031f0'){
			supportObj.show_other_worktype = true;					
		}else{
			supportObj.show_other_worktype = false;
		}

		if (user)
			supportObj.user = user;
		else
			supportObj.found = false;

		res.render('admin/add_user', supportObj);

	});

	router.get('/admin/users/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var languages = await LanguageController.getListAdmin('a');
		var indian_languages = await LanguageController.getListAdmin('i');
		var foreign_languages = await LanguageController.getListAdmin('f');

		var physique = await PhysiqueController.getListAdmin();

		var activities = await ActivityController.getListAdmin();

		var complexions = await ComplexionController.getListAdmin();
		var eye_colors = await EyeColorController.getListAdmin();
		var hair_colors = await HairColorController.getListAdmin();
		var hair_lengths = await HairLengthController.getListAdmin();

		var project_types = await WorkTypeController.getListAdmin();

		var supportObj = {
			'title': 'IFH',
			'type': 'users',
			'sub': 'all',
			'host': config.pre + req.headers.host,
			'user': {},
			'modelTab': false,
			'companyDetail': false,
			'writerDetail': false,
			'workTab': false,
			'equipmentTab': false,
			'propTab': false,
			'locationTab': false,
			'found': true,
			'admin': req.admin,
			languages,
			indian_languages,
			foreign_languages,
			physique,
			activities,
			complexions,
			eye_colors,
			hair_colors,
			hair_lengths,
			project_types
		};

		var user = await UserController.getUser(req, req.params.id);

		if (user.sub_category_id == "5b4084f5b6d6f1d5f0402a7f") {
			supportObj.writerDetail = true;
		}

		var talentModelActor = ["5b40849eb6d6f1d5f040260a", "5b4084f4b6d6f1d5f0402a6b", "5b4084f4b6d6f1d5f0402a73", "5b4084f5b6d6f1d5f0402a77", "5b4084f5b6d6f1d5f0402a7c", "5b4084f5b6d6f1d5f0402a7f", "5b4084f5b6d6f1d5f0402a9d", "5b408585b6d6f1d5f04031ed", "5b408585b6d6f1d5f04031f0", "5b408565b6d6f1d5f040304f", "5b408464b6d6f1d5f040231c"];
		if (talentModelActor.indexOf(user.sub_category_id) > -1) {
			supportObj.modelTab = true;
		}
		if (talentModelActor.indexOf(user.sub_category_id) == -1) {
			supportObj.companyDetail = true;
		}
		var projectHolders = talentModelActor;
		projectHolders.push("5b4083a3b6d6f1d5f0401946");
		projectHolders.push("5b408408b6d6f1d5f0401e67");
		projectHolders.push("5b408409b6d6f1d5f0401e6f");
		projectHolders.push("5b408409b6d6f1d5f0401e71");
		projectHolders.push("5b408409b6d6f1d5f0401e73");
		projectHolders.push("5b40840ab6d6f1d5f0401e77");
		projectHolders.push("5b40837bb6d6f1d5f0401733");
		//Photographer, Producer/Client, Talent, Model/Actor

		if (projectHolders.indexOf(user.sub_category_id) > -1) {
			supportObj.workTab = true;
		}

		if (user.sub_category_id == "5b4c7837b6d6f1d5f0cbe783") {
			supportObj.propTab = true;
		}
		if (user.sub_category_id == "5b406692767c271b8c8623fe" || user.category == "5b40837ab6d6f1d5f040172c") {
			supportObj.equipmentTab = true;
		}
		if (user.sub_category_id == "5b40837bb6d6f1d5f0401731") {
			supportObj.locationTab = true;
		}

		console.log("USER", user);

		supportObj.categories = await CategoryController.mainlistL();

		if(Service.validateObjectId(user.category)){
			var catData = await CategoryController.subListAdmin(user.category);
			supportObj.sub_categories = catData.sub_categories;
			supportObj.main_category_id = catData.main_category_id;
			supportObj.sub_category_id = catData.sub_category_id;
		}else{
			supportObj.sub_categories = [];
			supportObj.main_category_id = "";
			supportObj.sub_category_id = "";
		}

		if (user)
			supportObj.user = user;
		else
			supportObj.found = false;

		res.render('admin/view_user_detail', supportObj);

	});

	router.get('/admin/sub_categories/:id', async function (req, res) {
		var catData = await CategoryController.subFromMainListAdmin(req.params.id);
		res.status(200).send(Service.response(1,localization.success,catData));
	});

	router.get('/admin/users/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var languages = await LanguageController.getListAdmin('a');
		var indian_languages = await LanguageController.getListAdmin('i');
		var foreign_languages = await LanguageController.getListAdmin('f');

		var physique = await PhysiqueController.getListAdmin();

		var activities = await ActivityController.getListAdmin();

		var complexions = await ComplexionController.getListAdmin();
		var eye_colors = await EyeColorController.getListAdmin();
		var hair_colors = await HairColorController.getListAdmin();
		var hair_lengths = await HairLengthController.getListAdmin();

		var project_types = await WorkTypeController.getListAdmin();
		var academic_types = await AcademicTypeController.getListAdmin();

		var supportObj = {
			'title': 'IFH',
			'type': 'users',
			'sub': 'all',
			'host': config.pre + req.headers.host,
			'user': {},
			'modelTab': false,
			'companyDetail': false,
			'writerDetail': false,
			'workTab': false,
			'equipmentTab': false,
			'propTab': false,
			'locationTab': false,
			'found': true,
			'admin': req.admin,
			languages,
			indian_languages,
			foreign_languages,
			physique,
			activities,
			complexions,
			eye_colors,
			hair_colors,
			hair_lengths,
			project_types,
			academic_types
		};

		var user = await UserController.getUser(req, req.params.id);

		if (user.sub_category_id == "5b4084f5b6d6f1d5f0402a7f") {
			supportObj.writerDetail = true;
		}

		var talentModelActor = ["5b40849eb6d6f1d5f040260a", "5b4084f4b6d6f1d5f0402a6b", "5b4084f4b6d6f1d5f0402a73", "5b4084f5b6d6f1d5f0402a77", "5b4084f5b6d6f1d5f0402a7c", "5b4084f5b6d6f1d5f0402a7f", "5b4084f5b6d6f1d5f0402a9d", "5b408585b6d6f1d5f04031ed", "5b408585b6d6f1d5f04031f0", "5b408565b6d6f1d5f040304f", "5b408464b6d6f1d5f040231c"];
		if (talentModelActor.indexOf(user.sub_category_id) > -1) {
			supportObj.modelTab = true;
		}
		if (talentModelActor.indexOf(user.sub_category_id) == -1) {
			supportObj.companyDetail = true;
		}
		var projectHolders = talentModelActor;
		projectHolders.push("5b4083a3b6d6f1d5f0401946");
		projectHolders.push("5b408408b6d6f1d5f0401e67");
		projectHolders.push("5b408409b6d6f1d5f0401e6f");
		projectHolders.push("5b408409b6d6f1d5f0401e71");
		projectHolders.push("5b408409b6d6f1d5f0401e73");
		projectHolders.push("5b40840ab6d6f1d5f0401e77");
		projectHolders.push("5b40837bb6d6f1d5f0401733");
		//Photographer, Producer/Client, Talent, Model/Actor

		if (projectHolders.indexOf(user.sub_category_id) > -1) {
			supportObj.workTab = true;
		}

		if (user.sub_category_id == "5b4c7837b6d6f1d5f0cbe783") {
			supportObj.propTab = true;
		}
		if (user.sub_category_id == "5b406692767c271b8c8623fe" || user.category == "5b40837ab6d6f1d5f040172c") {
			supportObj.equipmentTab = true;
		}
		if (user.sub_category_id == "5b40837bb6d6f1d5f0401731") {
			supportObj.locationTab = true;
		}


		supportObj.categories = await CategoryController.mainlistAdmin();

		if(Service.validateObjectId(user.sub_category_id)){
			var catData = await CategoryController.subListAdmin(user.sub_category_id);
			console.log("CATDATA",catData);
			supportObj.sub_categories = catData.sub_categories;
			supportObj.main_category_id = catData.main_category_id;
			supportObj.sub_category_id = catData.sub_category_id;
		}else{
			supportObj.sub_categories = [];
			supportObj.main_category_id = "";
			supportObj.sub_category_id = "";
		}

		//model || actor
		if(supportObj.sub_category_id.toString() === '5b408585b6d6f1d5f04031ed' && supportObj.sub_category_id.toString() === '5b408585b6d6f1d5f04031f0'){
			supportObj.show_other_worktype = true;					
		}else{
			supportObj.show_other_worktype = false;
		}

		if (user)
			supportObj.user = user;
		else
			supportObj.found = false;

		res.render('admin/user_detail', supportObj);

	});

	router.get('/admin/users/prime', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var users = await UserController.getAllUsers(1);

		res.render('admin/users', {
			'title': 'IFH',
			'type': 'users',
			'sub': 'prime',
			'host': config.pre + req.headers.host,
			'users': users.list,
			'total': users.total,
			'type':1,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/users/non-prime', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var users = await UserController.getAllUsers(2);

		res.render('admin/users', {
			'title': 'IFH',
			'type': 'users',
			'sub': 'non-prime',
			'host': config.pre + req.headers.host,
			'users': users.list,
			'total': users.total,
			'type':2,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/jobs', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var jobs = await JobController.getAllJobs();

		res.render('admin/jobs', {
			'title': 'IFH',
			'type': 'jobs',
			'sub': 'jobs',
			'host': config.pre + req.headers.host,
			'jobs': jobs,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/jobs/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var supportObj = {
			'title': 'IFH',
			'type': 'jobs',
			'sub': 'jobs',
			'host': config.pre + req.headers.host,
			'job': {},
			'found': true,
			'admin': req.admin
		}

		var job = await JobController.getJobDetailAdmin(req.params.id);

		if (job)
			supportObj.job = job;
		else
			supportObj.found = false;

		res.render('admin/job_detail', supportObj);
	});
    
    router.get('/admin/jobs/:id/:action', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		return JobController.JobDetailActionAdmin(req,res);
	});

	router.get('/admin/subscriptions', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var plans = await SubscriptionController.listPlansAdmin();
		var free_credit = await DefaultController.getprimeCredits();

		res.render('admin/subscriptions', {
			'title': 'IFH',
			'type': 'subscriptions',
			'sub': 'subscriptions',
			'host': config.pre + req.headers.host,
			'plans': plans,
			'free_credit': free_credit,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/payments', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var payments = await SubscriptionController.listPaymentsAdmin();

		res.render('admin/payments', {
			'title': 'Payments history',
			'type': 'payments',
			'sub': 'payments',
			'host': config.pre + req.headers.host,
			'payments': payments,
			'admin': req.admin
		});
	});

	router.get('/admin/reviews', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var reviews = await UserController.reviewsAll();

		res.render('admin/reviews', {
			'title': 'IFH',
			'type': 'reviews',
			'sub': 'reviews',
			'host': config.pre + req.headers.host,
			'reviews': reviews,
			'admin': req.admin
		});
	});

	router.get('/admin/mailbox', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var mailbox = await ContactController.listContact();

		res.render('admin/mailbox', {
			'title': 'IFH',
			'type': 'mailbox',
			'sub': 'mailbox',
			'host': config.pre + req.headers.host,
			'mailbox': mailbox,
			'admin': req.admin
		});
	});

	router.get('/admin/mailbox_web', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var mailbox = await ContactController.listContactWeb();

		res.render('admin/mailbox', {
			'title': 'Mailbox',
			'type': 'mailbox_web',
			'sub': 'mailbox_web',
			'host': config.pre + req.headers.host,
			'mailbox': mailbox,
			'admin': req.admin
		});
	});

	router.get('/admin/cms/about', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var about = await CmsController.getAboutUsAdmin();
		
		res.render('admin/about', {
			'title': 'IFH',
			'type': 'cms',
			'sub': 'about',
			'host': config.pre + req.headers.host,
			'about': about,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/cms/privacy', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var privacy = await CmsController.getPrivacyPolicyAdmin();

		res.render('admin/privacy', {
			'title': 'IFH',
			'type': 'cms',
			'sub': 'privacy',
			'host': config.pre + req.headers.host,
			'privacy': privacy,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/cms/terms', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var terms = await CmsController.getTermsAdmin();

		res.render('admin/terms', {
			'title': 'IFH',
			'type': 'cms',
			'sub': 'terms',
			'host': config.pre + req.headers.host,
			'terms': terms,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});
	
	router.get('/admin/cms/contact', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var contact = await CmsController.getContactAdmin();

		res.render('admin/contact', {
			'title': 'IFH',
			'type': 'cms',
			'sub': 'contact',
			'host': config.pre + req.headers.host,
			'contact': contact,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/profile', Service.authenticateAdmin, function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		res.render('admin/profile', {
			'title': 'IFH',
			'type': 'profile',
			'sub': 'profile',
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.post('/admin/login', async function (req, res) {
		return SuperAdminController.login(req, res);
	});

	router.get('/admin/logout', Service.authenticateAdmin, async function (req, res) {
		console.log("HIT Logout");
		req.session.destroy(function (err) {
			// cannot access session here
			console.log("ERR", err);
			res.send();
		})
	});

	router.post('/admin/add_user_profile', async function (req, res) {
		return UserController.addProfileFromAdmin(req, res);
	});

	router.post('/admin/update_user_profile', async function (req, res) {
		return UserController.updateProfileFromAdmin(req, res);
	});

	router.post('/admin/update_user_password', async function (req, res) {
		return UserController.updatePasswordFromAdmin(req, res);
	});

	router.post('/admin/update_user_credits', async function (req, res) {
		return UserController.updateCreditsFromAdmin(req, res);
	});

	router.post('/admin/update_user_state', async function (req, res) {
		return UserController.updateStateFromAdmin(req, res);
	});

	router.post('/admin/delete_user', async function (req, res) {
		return UserController.deleteUserFromAdmin(req, res);
	});

	router.post('/admin/delete_job', async function (req, res) {
		return JobController.removeJobAdmin(req, res);
	});

	router.post('/admin/update_admin_profile', Service.authenticateAdmin, async function (req, res) {
		return SuperAdminController.updateProfile(req, res);
	});

	router.post('/admin/update_admin_password', Service.authenticateAdmin, async function (req, res) {
		return SuperAdminController.updatePassword(req, res);
	});

	router.post('/admin/delete_review', async function (req, res) {
		return JobController.removeReviewAdmin(req, res);
	});

	router.post('/admin/update_website_contact', async function (req, res) {
		return WebsiteController.updateContact(req, res);
	});
    
    router.post('/admin/update_cms_about', async function (req, res) {
		return CmsController.updateAboutUs(req, res);
	});

	router.post('/admin/update_cms_terms', async function (req, res) {
		return CmsController.updateTerms(req, res);
	});
	
	router.post('/admin/update_cms_contact', async function (req, res) {
		return CmsController.updateContact(req, res);
	});

	router.post('/admin/update_cms_privacy', async function (req, res) {
		return CmsController.updatePrivacy(req, res);
    });
    
    router.get('/admin/manage/web/page/contact', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
        }
        
        let data = {};
        data = await WebsiteController.getAll();

		res.render('admin/contact_web', {
			'title': 'Manage Contact Page',
			'type': 'web_contact_page',
			'sub': 'all',
			'host': config.pre + req.headers.host,
			'data': data,
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});

	// MAIN IFH STARTS
	router.get('/admin/movies/all', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var movies = await MovieController.getAllMovies(req,res,0);
        var language = await LanguageController.getListAdmin("i");

		res.render('admin/movies', {
			'title': 'All Movies',
			'type': 'movies',
			'sub': 'all',
			'req': req,
			'host': config.pre + req.headers.host,
			'movies': movies.list,
			'language': language,
			'total': movies.total,
            'type_n': movies.type,
            'is_upcoming':false,
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/movies/reviews', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var movies = await MovieController.getAllPendingReviews();

		res.render('admin/movie_reviews', {
			'title': 'Pending reviews',
			'type': 'movies',
			'sub': 'reviews',
			'host': config.pre + req.headers.host,
            'reviews': movies,
            'is_upcoming':false,
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/movies/upcoming', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var movies = await MovieController.getAllMovies(req,res,1);
        var language = await LanguageController.getListAdmin("i");
		console.log('roles :: ',req.innerRights);

		res.render('admin/movies', {
			'title': 'Upcoming movies',
			'type': 'movies',
            'sub': 'upcoming',
            'req': req,
			'host': config.pre + req.headers.host,
            'movies': movies.list,
            'language': language,
			'total': movies.total,
            'type_n': movies.type,
            'is_upcoming':true,
			'access_types': config.access_types_string,
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/movies/top-rated', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var movies = await MovieController.getAllMovies(req,res,2);
        var language = await LanguageController.getListAdmin("i");

		res.render('admin/movies', {
			'title': 'Top rated movies',
			'type': 'movies',
            'sub': 'top-rated',
            'req': req,
			'host': config.pre + req.headers.host,
            'movies': movies.list,
            'language': language,
			'total': movies.total,
            'type_n': movies.type,
            'is_upcoming':false,
			'moviesSearch': [],
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/movies/on-fire', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var movies = await MovieController.getAllMovies(req,res,3);
        var language = await LanguageController.getListAdmin("i");
        
		res.render('admin/movies', {
			'title': 'Movies on fire',
			'type': 'movies',
            'sub': 'on-fire',
            'req': req,
			'host': config.pre + req.headers.host,
            'movies': movies.list,
            'language': language,
			'total': movies.total,
            'type_n': movies.type,
            'is_upcoming':false,
			'moviesSearch': [],
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/movies/on-air', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}
		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}
		var movies = await MovieController.getAllMovies(req,res,4);
        var language = await LanguageController.getListAdmin("i");

		res.render('admin/movies', {
			'title': 'Movies on air',
			'type': 'movies',
            'sub': 'on-air',
            'req': req,
			'host': config.pre + req.headers.host,
            'movies': movies.list,
            'language': language,
			'total': movies.total,
            'type_n': movies.type,
            'is_upcoming':false,
			'moviesSearch': [],
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/movies/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}
		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();
		//Get Genres
		var genres = await GenreController.getActiveGenresListAdmin();
		var movie_types = config.movie_types;
		var movie_color_types = config.movie_colors;

		res.render('admin/add_movie', {
			'title': 'Movies | add',
			'type': 'movies',
			'sub': 'all',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'genres': genres,
            'movie_types': movie_types,
            'is_upcoming':false,
			'movie_color_types':movie_color_types,
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/movies/add_via_sheet', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}
		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		res.render('admin/add_movie_sheet', {
			'title': 'Movies | Add sheet',
			'type': 'movie',
			'sub': 'all-movies',
			'host': config.pre + req.headers.host,
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/celebrities/add_via_sheet', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		// if(!req.innerRights.add_rights){
		// 	return res.redirect('/admin/dashboard');
		// }

		res.render('admin/add_celebrity_sheet', {
			'title': 'Celebrities | Add sheet',
			'type': 'celebrity',
			'sub': 'all',
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});
	function pad(n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}
	
	router.get('/admin/movies/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var movie = await MovieController.getDetail(req.params.id);
		var languages = await LanguageController.getListAdmin();
		var celebritySearch = await CelebrityController.getAllShort(0);
		var genres = await GenreController.getActiveGenresListAdmin();

		console.log("HOST", config.pre + req.headers.host);

		var today = moment(parseInt(new Date().getTime())).tz("Asia/Kolkata").format('YYYY-MM-DD');
		console.log("TODAY",today);
		console.log("TODAY",movie.release_date);

		var strs = movie.release_date.split('/');
	
		var release_day = strs[2]+"-"+pad(strs[1],2)+"-"+pad(strs[0],2);
			
		// var release_day = moment(movie.release_date).tz("Asia/Kolkata");
		console.log("Release date",release_day);

		var boxOffice = false;
		if (release_day <= today) {
			boxOffice = true;
		}
		var movie_types = config.movie_types;
		var movie_color_types = config.movie_colors;

		res.render('admin/edit_movie', {
			'title': 'Movies | edit',
			'type': 'movie',
			'sub': 'all-movies',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'movie': movie,
			'celebritySearch': celebritySearch,
			'boxOffice': boxOffice,
			'today': today,
			'onFire':config.dashboard.onFire,
			'onAir':config.dashboard.onAir,
			'topRated':config.dashboard.topRated,
			'genres': genres,
			'movie_types':movie_types,
			'movie_color_types':movie_color_types,
			'admin': req.admin
		});
	});

	router.get('/admin/movies/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var movie = await MovieController.getDetail(req.params.id);
		var languages = await LanguageController.getListAdmin();
		var celebritySearch = await CelebrityController.getAll();

		console.log("HOST", config.pre + req.headers.host);

		var today = moment(parseInt(new Date().getTime())).tz("Asia/Kolkata").format("YYYY-MM-DD");

		var boxOffice = false;

		if (movie.release_date <= today) {
			boxOffice = true;
		}
		var movie_types = config.movie_types;
		var movie_color_types = config.movie_colors;

		res.render('admin/view_movie', {
			'title': 'Movies | edit',
			'type': 'movie',
			'sub': 'all-movies',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'movie': movie,
			'celebritySearch': celebritySearch,
			'boxOffice': boxOffice,
			'today': today,
			'movie_types':movie_types,
			'movie_color_types':movie_color_types,
			'admin': req.admin
		});
	});

	router.get('/admin/short_films', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var movies = await ShortFilmController.getAll();

		res.render('admin/short_film', {
			'title': 'Short films',
			'type': 'short_films',
			'sub': 'all_short_films',
			'host': config.pre + req.headers.host,
			'movies': movies,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/short_films/reviews', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var movies = await ShortFilmController.getAllPendingReviews();

		res.render('admin/short_film_reviews', {
			'title': 'Pending reviews',
			'type': 'short_films',
			'sub': 'short_films_reviews',
			'host': config.pre + req.headers.host,
            'reviews': movies,
            'is_upcoming':false,
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});	

	router.get('/admin/web_series', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var movies = await WebSeriesController.getAll();

		res.render('admin/webseries', {
			'title': 'Web series',
			'type': 'web_series',
			'sub': 'all_web_series',
			'host': config.pre + req.headers.host,
			'movies': movies,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/web_series/reviews', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var movies = await WebSeriesController.getAllPendingReviews();

		res.render('admin/web_series_reviews', {
			'title': 'Pending reviews',
			'type': 'web_series',
			'sub': 'web_series_reviews',
			'host': config.pre + req.headers.host,
            'reviews': movies,
            'is_upcoming':false,
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});	

	router.get('/admin/news', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var movies = await NewsController.getAll();
		
		res.render('admin/news', {
			'title': 'News',
			'type': 'news',
			'sub': 'news',
			'host': config.pre + req.headers.host,
			'movies': movies.list,
			'total': movies.total,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	//Langaue Router
	router.get('/admin/language', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var language = await LanguageController.getListAdminAll();
		res.render('admin/language', {
			'title': 'Language',
			'type': 'language',
			'sub': 'language',
			'host': config.pre + req.headers.host,
			'language': language,
			'admin': req.admin
		});
	});

	router.get('/admin/theatre', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var movies = await TheatreController.getAll();

		res.render('admin/theatre', {
			'title': 'Theater',
			'type': 'theatre',
			'sub': 'all_theatre',
			'host': config.pre + req.headers.host,
			'movies': movies,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/theatre/reviews', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var movies = await TheatreController.getAllPendingReviews();

		res.render('admin/theatre_reviews', {
			'title': 'Pending reviews',
			'type': 'theatre',
			'sub': 'theatre_reviews',
			'host': config.pre + req.headers.host,
            'reviews': movies,
            'is_upcoming':false,
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/celebrities/all', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var celebrities = await CelebrityController.getAllCelebs(req,res,0);
		
		res.render('admin/celebrities', {
			'title': 'Celebrities',
			'type': 'celebrities',
			'sub': 'all',
			'req': req,
			'host': config.pre + req.headers.host,
			'celebrities': celebrities.list,
			'total': celebrities.total,
			'type_n':celebrities.type,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/celebrities/top', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var celebrities = await CelebrityController.getAllCelebs(req,res,1);
		console.log("CELEBRITIES",JSON.stringify(celebrities,undefined,2));
		// var celebritySearch = await CelebrityController.getNonTopList();

		res.render('admin/celebrities', {
			'title': 'Top celebrities',
			'type': 'celebrities',
			'sub': 'top',
			'req': req,
			'host': config.pre + req.headers.host,
			'celebrities': celebrities.list,
			'total': celebrities.total,
			'type_n':celebrities.type,
			'celebritySearch': [],
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/celebrities/popular', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var celebrities = await CelebrityController.getAllCelebs(req,res,2);
		// var celebritySearch = await CelebrityController.getNonTopList();
		// var celebritySearchPopular = await CelebrityController.getNonPopularList();

		res.render('admin/celebrities', {
			'title': 'Most Popular',
			'type': 'celebrities',
			'sub': 'popular',
			'req': req,
			'host': config.pre + req.headers.host,
			'celebrities': celebrities.list,
			'total': celebrities.total,
			'type_n':celebrities.type,
			'celebritySearch': [],
			'celebritySearchPopular': [],
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/celebrities/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}
		// console.log('access rights ::',req.innerRights);
		// if(!req.innerRights.add_rights){
		// 	return res.redirect('/admin/dashboard');
		// }

		var celebrities = await CelebrityController.getAll();
		var languages = await LanguageController.getListAdmin('a');
		var indian_languages = await LanguageController.getListAdmin('i');
		var foreign_languages = await LanguageController.getListAdmin('f');

		var physique = await PhysiqueController.getListAdmin();

		var activities = await ActivityController.getListAdmin();

		var complexions = await ComplexionController.getListAdmin();
		var eye_colors = await EyeColorController.getListAdmin();
		var hair_colors = await HairColorController.getListAdmin();
		var hair_lengths = await HairLengthController.getListAdmin();

		var project_types = await WorkTypeController.getListAdmin();
		
		var profession = await ProfessionController.getlistAdmin();

		res.render('admin/add_celebrity', {
			'title': 'Celebrities | Add',
			'type': 'celebrities',
			'sub': 'all',
			'languages': languages,
			'indian_languages': indian_languages,
			'foreign_languages': foreign_languages,
			'physique': physique,
			'activities': activities,
			'complexions': complexions,
			'eye_colors': eye_colors,
			'hair_colors': hair_colors,
			'hair_lengths': hair_lengths,
			'project_types': project_types,
			'profession': profession,
			'host': config.pre + req.headers.host,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/celebrities/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		// if(!req.innerRights.update_rights){
		// 	return res.redirect('/admin/dashboard');
		// }

		if (!req.params.id) {
			return res.redirect('/404');
		}
		console.log("REQ PARAM",req.params);

		var languages = await LanguageController.getListAdmin('a');
		var indian_languages = await LanguageController.getListAdmin('i');
		var foreign_languages = await LanguageController.getListAdmin('f');

		var physique = await PhysiqueController.getListAdmin();

		var activities = await ActivityController.getListAdmin();

		var complexions = await ComplexionController.getListAdmin();
		var eye_colors = await EyeColorController.getListAdmin();
		var hair_colors = await HairColorController.getListAdmin();
		var hair_lengths = await HairLengthController.getListAdmin();

		var project_types = await WorkTypeController.getListAdmin();
		var profession = await ProfessionController.getlistAdmin();

		var celeb = await CelebrityController.getDetailAdmin(req.params.id);
		console.log('celeb.family_details.father_name::',celeb.family_details.father_name);
		var old_family_details = {};
		var allceleb = [];
		// if(typeof celeb.family_details.father_name !== 'undefined'){
		// 	if(Service.validateObjectId(celeb.family_details.father_name)){
		// 		var celebFData = await CelebrityController.getAllAdmin(celeb.family_details.father_name);
		// 		allceleb.push(celebFData);
		// 	}else {
		// 		old_family_details.father_name = celeb.family_details.father_name;
		// 		celeb.family_details.father_name = '';
		// 	}
		// }
		// if(typeof celeb.family_details.mother_name !== 'undefined'){
		// 	if(Service.validateObjectId(celeb.family_details.mother_name)){
		// 		var celebMData = await CelebrityController.getAllAdmin(celeb.family_details.mother_name);
		// 		allceleb.push(celebMData);
		// 	}else {
		// 		old_family_details.mother_name = celeb.family_details.mother_name;
		// 		celeb.family_details.mother_name = '';
		// 	}
		// }
		// if(typeof celeb.family_details.spouse_name !== 'undefined'){
		// 	if(Service.validateObjectId(celeb.family_details.spouse_name)){
		// 		var celebSPData = await CelebrityController.getAllAdmin(celeb.family_details.spouse_name);
		// 		allceleb.push(celebSPData);
		// 	}else {
		// 		old_family_details.spouse_name = celeb.family_details.spouse_name;
		// 		celeb.family_details.spouse_name = '';
		// 	}
		// }
		// if(celeb.family_details.children_name != ''){
		// 	var celebCData = await CelebrityController.getAllAdminArray(celeb.family_details.children_name);
		// 	// console.log('celebCData',celebCData);
		// 	for(let c of celebCData){
		// 		allceleb.push({
		// 			'id': c.id,
		// 			'name': c.name
		// 		});
		// 	}
		// } else {
		// 	old_family_details.children_name = celeb.family_details.children_name;
		// 	celeb.family_details.children_name = [];
		// }
		// if(celeb.family_details.siblings != ''){
		// 	var celebSBData = await CelebrityController.getAllAdminArray(celeb.family_details.siblings);
		// 	for(let c of celebSBData){
		// 		allceleb.push({
		// 			'id': c.id,
		// 			'name': c.name
		// 		});
		// 	}
		// } else {
		// 	old_family_details.siblings = celeb.family_details.siblings;
		// 	celeb.family_details.siblings = [];
		// }
		
				
		// allceleb = _.uniqBy(allceleb,'id');
		// console.log('allceleb::',allceleb);

		res.render('admin/edit_celebrity', {
			'title': 'Celebrities | Edit',
			'type': 'celebrities',
			'sub': 'all',
			'languages': languages,
			'indian_languages': indian_languages,
			'foreign_languages': foreign_languages,
			'physique': physique,
			'activities': activities,
			'complexions': complexions,
			'eye_colors': eye_colors,
			'hair_colors': hair_colors,
			'hair_lengths': hair_lengths,
			'project_types': project_types,
			'profession': profession,
			'host': config.pre + req.headers.host,
			'celeb': celeb,
			'allceleb': allceleb,
			'old_family_details': old_family_details,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/celebrities/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}
		
		// if(!req.innerRights.detail_rights){
		// 	return res.redirect('/admin/dashboard');
		// }

		if (!req.params.id) {
			return res.redirect('/404');
		}

		var languages = await LanguageController.getListAdmin('a');
		var indian_languages = await LanguageController.getListAdmin('i');
		var foreign_languages = await LanguageController.getListAdmin('f');

		var physique = await PhysiqueController.getListAdmin();

		var activities = await ActivityController.getListAdmin();

		var complexions = await ComplexionController.getListAdmin();
		var eye_colors = await EyeColorController.getListAdmin();
		var hair_colors = await HairColorController.getListAdmin();
		var hair_lengths = await HairLengthController.getListAdmin();

		var project_types = await WorkTypeController.getListAdmin();
		var profession = await ProfessionController.getlistAdmin();

		var celeb = await CelebrityController.getDetailAdmin(req.params.id);
		// console.log('celeb.family_details.children_name::',celeb.family_details.children_name);
		var allceleb = [];
		// if(typeof celeb.family_details.father_name !== 'undefined'){
		// 	if(Service.validateObjectId(celeb.family_details.father_name)){
		// 		var celebFData = await CelebrityController.getAllAdmin(celeb.family_details.father_name);
		// 		allceleb.push(celebFData);
		// 	}else {
		// 		celeb.family_details.father_name = '';
		// 	}
		// }
		// if(typeof celeb.family_details.mother_name !== 'undefined'){
		// 	if(Service.validateObjectId(celeb.family_details.mother_name)){
		// 		var celebMData = await CelebrityController.getAllAdmin(celeb.family_details.mother_name);
		// 		allceleb.push(celebMData);
		// 	}else {
		// 		celeb.family_details.mother_name = '';
		// 	}
		// }
		// if(typeof celeb.family_details.spouse_name !== 'undefined'){
		// 	if(Service.validateObjectId(celeb.family_details.spouse_name)){
		// 		var celebSPData = await CelebrityController.getAllAdmin(celeb.family_details.spouse_name);
		// 		allceleb.push(celebSPData);
		// 	}else {
		// 		celeb.family_details.spouse_name = '';
		// 	}
		// }
		// if(celeb.family_details.children_name != ''){
		// 	var celebCData = await CelebrityController.getAllAdminArray(celeb.family_details.children_name);
		// 	// console.log('celebCData',celebCData);
		// 	for(let c of celebCData){
		// 		allceleb.push({
		// 			'id': c.id,
		// 			'name': c.name
		// 		});
		// 	}
		// } else {
		// 	celeb.family_details.children_name = [];
		// }
		// if(celeb.family_details.siblings != ''){
		// 	var celebSBData = await CelebrityController.getAllAdminArray(celeb.family_details.siblings);
		// 	for(let c of celebSBData){
		// 		allceleb.push({
		// 			'id': c.id,
		// 			'name': c.name
		// 		});
		// 	}
		// } else {
		// 	celeb.family_details.siblings = [];
		// }
		
				
		// allceleb = _.uniqBy(allceleb,'id');
		// console.log('allceleb::',allceleb);

		res.render('admin/view_celebrity', {
			'title': 'Celebrities | View',
			'type': 'celebrities',
			'sub': 'all',
			'languages': languages,
			'indian_languages': indian_languages,
			'foreign_languages': foreign_languages,
			'physique': physique,
			'activities': activities,
			'complexions': complexions,
			'eye_colors': eye_colors,
			'hair_colors': hair_colors,
			'hair_lengths': hair_lengths,
			'project_types': project_types,
			'profession': profession,
			'host': config.pre + req.headers.host,
			'celeb': celeb,
			'allceleb': allceleb,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/gallery/images', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var images = await GalleryController.getImagesAdmin();

		res.render('admin/gallery_images', {
			'title': 'Gallery | Images',
			'type': 'gallery',
			'sub': 'images',
			'host': config.pre + req.headers.host,
			'images': images,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/gallery/videos', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var videos = await GalleryController.getVideosAdmin();

		res.render('admin/gallery_videos', {
			'title': 'Gallery | Videos',
			'type': 'gallery',
			'sub': 'videos',
			'host': config.pre + req.headers.host,
			'videos': videos,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/press-details', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var press = await PressController.getAll();

		res.render('admin/press', {
			'title': 'Press Details',
			'type': 'press-details',
			'sub': 'press-details',
			'host': config.pre + req.headers.host,
			'press': press,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/press-details/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		res.render('admin/add_press', {
			'title': 'Press Details | Add',
			'type': 'press-details',
			'sub': 'press-details',
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/press-details/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var press = await PressController.get(req.params.id);

		if (!press)
			return res.render('404');

		res.render('admin/view_press', {
			'title': 'Press Details | View',
			'type': 'press-details',
			'sub': 'press-details',
			'host': config.pre + req.headers.host,
			'press': press,
			'admin': req.admin
		});
	});

	router.get('/admin/press-details/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var press = await PressController.get(req.params.id);

		if (!press)
			return res.render('404');

		res.render('admin/edit_press', {
			'title': 'Press Details | Edit',
			'type': 'press-detail',
			'sub': 'press-details',
			'host': config.pre + req.headers.host,
			'press': press,
			'admin': req.admin
		});
	});

	router.get('/admin/ad-world/television-commercial', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var tvcom = await TvComController.getAll();

		res.render('admin/tvcom', {
			'title': 'Ad world | Television commercial',
			'type': 'ad-world',
			'sub': 'television-commercial',
			'host': config.pre + req.headers.host,
			'tvcom': tvcom,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/television-commercial/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var categories = await TvComController.getCategory();

		res.render('admin/add_tvc', {
			'title': 'Ad world | Television commercial | Add',
			'type': 'ad',
			'sub': 'tvcom',
			'host': config.pre + req.headers.host,
			'categories': categories,
			'celebritySearch': [],
			'admin': req.admin
		});
	});

	router.get('/admin/television-commercial/categories', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var categories = await TvComController.getCategory();
		res.render('admin/tvcom_cat', {
			'title': 'Ad world | Television commercial | Manage Sub-categories',
			'type': 'ad',
			'sub': 'tvcom',
			'host': config.pre + req.headers.host,
			'categories': categories,
			'admin': req.admin
		});
	});
    
	router.get('/admin/television-commercial/reviews', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var movies = await TvComController.getAllPendingReviews();

		res.render('admin/tvc_reviews', {
			'title': 'Pending reviews',
			'type': 'ad-world',
			'sub': 'tvc-reviews',
			'host': config.pre + req.headers.host,
            'reviews': movies,
            'is_upcoming':false,
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});	

    router.get('/admin/magazine/categories', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var categories = await MagazineController.getCategory();
		res.render('admin/magazine_cat', {
			'title': 'Ad world | Magazine | Manage Sub-categories',
			'type': 'ad',
			'sub': 'magazine',
			'host': config.pre + req.headers.host,
			'categories': categories,
			'admin': req.admin
		});
	});

	router.get('/admin/television-commercial/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var tvcom = await TvComController.get(req.params.id);

		if (!tvcom)
			return res.render('404');

		var categories = await TvComController.getCategory();
		var celebritySearch = await CelebrityController.getAll();

		res.render('admin/view_tvc', {
			'title': 'Ad world | Television commercial | View',
			'type': 'ad',
			'sub': 'tvcom',
			'host': config.pre + req.headers.host,
			'categories': categories,
			'celebritySearch': celebritySearch,
			'tvcom': tvcom,
			'admin': req.admin
		});
	});

	router.get('/admin/television-commercial/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var tvcom = await TvComController.get(req.params.id);

		if (!tvcom)
			return res.render('404');

		var categories = await TvComController.getCategory();

		res.render('admin/edit_tvc', {
			'title': 'Ad world | Television commercial | Edit',
			'type': 'ad',
			'sub': 'tvcom',
			'host': config.pre + req.headers.host,
			'categories': categories,
			'celebritySearch': [],
			'tvcom': tvcom,
			'admin': req.admin
		});
	});

	router.get('/admin/ad-world/magazine', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var tvc = await MagazineController.getAll();

		res.render('admin/magazine', {
			'title': 'Ad world | Magazine Cover',
			'type': 'ad-world',
			'sub': 'magazine',
			'host': config.pre + req.headers.host,
			'tvc': tvc,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/magazine/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

        var categories = await MagazineController.getCategory();

		res.render('admin/add_magazine', {
			'title': 'Ad world | Magazine cover | Add',
			'type': 'ad',
			'sub': 'magazine',
			'host': config.pre + req.headers.host,
			'celebritySearch': [],
			'categories': categories,
			'admin': req.admin
		});
	});

	router.get('/admin/magazine/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var magazine = await MagazineController.get(req.params.id);
		if (!magazine)
        return res.render('404');
        
        var categories = await MagazineController.getCategory();

		res.render('admin/view_magazine', {
			'title': 'Ad world | Magazine Cover | View',
			'type': 'ad',
			'sub': 'magazine',
			'host': config.pre + req.headers.host,
			'celebritySearch': [],
			'magazine': magazine,
			'categories': categories,
			'admin': req.admin
		});
	});

	router.get('/admin/magazine/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var magazine = await MagazineController.get(req.params.id);
		console.log("MAGAZINE",magazine);
        
		if (!magazine)
        return res.render('404');
        
        var categories = await MagazineController.getCategory();
        
		res.render('admin/edit_magazine', {
			'title': 'Ad world | Magazine Cover | Edit',
			'type': 'ad',
			'sub': 'magazine',
			'host': config.pre + req.headers.host,
			'celebritySearch': [],
			'magazine': magazine,
			'categories': categories,
			'admin': req.admin
		});
	});

	router.get('/admin/ad-world/print-media', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var print_media = await PrintMediaController.getAll();

		res.render('admin/print-media', {
			'title': 'Ad world | Print media',
			'type': 'ad-world',
			'sub': 'print-media',
			'host': config.pre + req.headers.host,
			'printMedia': print_media,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/print-media/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var categories = await PrintMediaController.getCategory();

		res.render('admin/add_print_media', {
			'title': 'Ad world | print Media | Add',
			'type': 'ad',
			'sub': 'print',
			'host': config.pre + req.headers.host,
			'categories': categories,
			'celebritySearch': [],
			'admin': req.admin
		});
	});

	router.get('/admin/print-media/categories', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var categories = await PrintMediaController.getCategory();
		res.render('admin/print_media_cat', {
			'title': 'Ad world | print Media | Manage Sub-categories',
			'type': 'ad',
			'sub': 'print',
			'host': config.pre + req.headers.host,
			'categories': categories,
			'admin': req.admin
		});
	});

	router.get('/admin/print-media/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}
		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}
		var print_media = await PrintMediaController.get(req.params.id);

		if (!print_media)
			return res.render('404');

		var categories = await PrintMediaController.getCategory();

		res.render('admin/view_print_media', {
			'title': 'Ad world | Print Media | View',
			'type': 'ad',
			'sub': 'print',
			'host': config.pre + req.headers.host,
			'categories': categories,
			'celebritySearch': [],
			'print': print_media,
			'admin': req.admin
		});
	});

	router.get('/admin/print-media/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var print_media = await PrintMediaController.get(req.params.id);

		if (!print_media)
			return res.render('404');

		var categories = await PrintMediaController.getCategory();

		res.render('admin/edit_print_media', {
			'title': 'Ad world | Print Media | Edit',
			'type': 'ad',
			'sub': 'print',
			'host': config.pre + req.headers.host,
			'categories': categories,
			'celebritySearch': [],
			'print': print_media,
			'admin': req.admin
		});
	});

	router.get('/admin/television/show', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var shows = await TvController.getAll('show');

		res.render('admin/shows', {
			'title': 'Television | Shows',
			'type': 'television',
			'sub': 'show',
			'host': config.pre + req.headers.host,
			'shows': shows,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/shows/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}
		
		var languages = await LanguageController.getListAdmin();
		var channels = await TvController.getListChannels();

		res.render('admin/add_show', {
			'title': 'Television | Shows | Add',
			'type': 'television',
			'sub': 'show',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'channels': channels,
			'admin': req.admin
		});
	});

	router.get('/admin/shows/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();
		var channels = await TvController.getListChannels();

		var show = await TvController.get(req.params.id);

		res.render('admin/edit_show', {
			'title': 'Television | Shows | Add',
			'type': 'tv',
			'sub': 'show',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'channels': channels,
			'celebritySearch': [],
			'show': show,
			'admin': req.admin
		});
	});

	router.get('/admin/shows/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();
		var channels = await TvController.getListChannels();

		var show = await TvController.get(req.params.id);

		res.render('admin/view_show', {
			'title': 'Television | Shows | Add',
			'type': 'tv',
			'sub': 'show',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'channels': channels,
			'celebritySearch': [],
			'show': show,
			'admin': req.admin
		});
	});

	router.get('/admin/television/reality', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var shows = await TvController.getAll('reality');

		res.render('admin/reality', {
			'title': 'Television | Reality shows',
			'type': 'television',
			'sub': 'reality',
			'host': config.pre + req.headers.host,
			'shows': shows,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/reality/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();
		var channels = await TvController.getListChannels();

		res.render('admin/add_reality', {
			'title': 'Television | Reality | Add',
			'type': 'tv',
			'sub': 'reality',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'channels': channels,
			'admin': req.admin
		});
	});

	router.get('/admin/reality/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();
		var channels = await TvController.getListChannels();

		var reality = await TvController.get(req.params.id);

		res.render('admin/edit_reality', {
			'title': 'Television | Reality | Add',
			'type': 'tv',
			'sub': 'reality',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'channels': channels,
			'celebritySearch': [],
			'reality': reality,
			'admin': req.admin
		});
	});

	router.get('/admin/reality/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();
		var channels = await TvController.getListChannels();

		var reality = await TvController.get(req.params.id);

		res.render('admin/view_reality', {
			'title': 'Television | Reality | Add',
			'type': 'tv',
			'sub': 'reality',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'channels': channels,
			'celebritySearch': [],
			'reality': reality,
			'admin': req.admin
		});
	});

	router.get('/admin/music/independent', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var musics = await MusicController.getAllMusic('independent');

		res.render('admin/independent', {
			'title': 'Music | Independent Artists',
			'type': 'music',
			'sub': 'independent',
			'host': config.pre + req.headers.host,
			'musics': musics,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/music/independent/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		res.render('admin/add_independent', {
			'title': 'Music | Independent Artists | Add',
			'type': 'music',
			'sub': 'independent',
			'languages': languages,
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/music/independent/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();
		// var celebritySearch = await CelebrityController.getAll();

		var music = await MusicController.get(req.params.id);

		res.render('admin/edit_independent', {
			'title': 'Music | Independent Artists | Edit',
			'type': 'music',
			'sub': 'independent',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'music': music,
			'admin': req.admin
		});
	});

	router.get('/admin/music/independent/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		var music = await MusicController.get(req.params.id);

		res.render('admin/view_independent', {
			'title': 'Music | Independent Artists | View',
			'type': 'music',
			'sub': 'independent',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'music': music,
			'admin': req.admin
		});
	});

	router.get('/admin/music/youtube', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var musics = await MusicController.getAllMusic('youtube');

		res.render('admin/youtube', {
			'title': 'Music | Youtube sensation',
			'type': 'music',
			'sub': 'youtube',
			'host': config.pre + req.headers.host,
			'musics': musics,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/music/youtube/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		res.render('admin/add_youtube', {
			'title': 'Music | Youtube sensation | Add',
			'type': 'music',
			'sub': 'youtube',
			'languages': languages,
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/music/youtube/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		var music = await MusicController.get(req.params.id);

		res.render('admin/edit_youtube', {
			'title': 'Music | Youtube sensation | Edit',
			'type': 'music',
			'sub': 'youtube',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'music': music,
			'admin': req.admin
		});
	});

	router.get('/admin/music/youtube/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		var music = await MusicController.get(req.params.id);

		res.render('admin/view_youtube', {
			'title': 'Music | Youtube sensation | View',
			'type': 'music',
			'sub': 'youtube',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'music': music,
			'admin': req.admin
		});
	});

	router.get('/admin/music/classical', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var musics = await MusicController.getAllMusic('classical');

		res.render('admin/classical', {
			'title': 'Music | Classical',
			'type': 'music',
			'sub': 'classical',
			'host': config.pre + req.headers.host,
			'musics': musics,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/music/classical/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		res.render('admin/add_classical', {
			'title': 'Music | Classical | Add',
			'type': 'music',
			'sub': 'classical',
			'languages': languages,
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/music/classical/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		var music = await MusicController.get(req.params.id);

		res.render('admin/edit_classical', {
			'title': 'Music | Classical | Edit',
			'type': 'music',
			'sub': 'classical',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'music': music,
			'admin': req.admin
		});
	});

	router.get('/admin/music/classical/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		var music = await MusicController.get(req.params.id);

		res.render('admin/view_classical', {
			'title': 'Music | Classical | View',
			'type': 'music',
			'sub': 'classical',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'music': music,
			'celebritySearch': [],
			'admin': req.admin
		});
	});

	router.get('/admin/music/rock-bands', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var musics = await MusicController.getAllMusic('rock-bands');

		res.render('admin/rock_bands', {
			'title': 'Music | Rock bands',
			'type': 'music',
			'sub': 'rock-bands',
			'host': config.pre + req.headers.host,
			'musics': musics,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/music/rock-bands/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		res.render('admin/add_rock_bands', {
			'title': 'Music | Rock bands | Add',
			'type': 'music',
			'sub': 'rock_bands',
			'languages': languages,
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/music/rock-bands/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		var music = await MusicController.get(req.params.id);

		res.render('admin/edit_rock_bands', {
			'title': 'Music | Rock bands | Edit',
			'type': 'music',
			'sub': 'rock_bands',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'music': music,
			'admin': req.admin
		});
	});

	router.get('/admin/music/rock-bands/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		var music = await MusicController.get(req.params.id);

		res.render('admin/view_rock_bands', {
			'title': 'Music | Rock bands | View',
			'type': 'music',
			'sub': 'rock_bands',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'music': music,
			'admin': req.admin
		});
	});

	router.get('/admin/music/bands', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var musics = await MusicController.getAllMusic('bands');

		res.render('admin/bands', {
			'title': 'Music | Bands',
			'type': 'music',
			'sub': 'bands',
			'host': config.pre + req.headers.host,
			'musics': musics,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/music/bands/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		res.render('admin/add_bands', {
			'title': 'Music | Bands | Add',
			'type': 'music',
			'sub': 'bands',
			'languages': languages,
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/music/bands/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		var music = await MusicController.get(req.params.id);

		res.render('admin/edit_bands', {
			'title': 'Music | Bands | Edit',
			'type': 'music',
			'sub': 'bands',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'music': music,
			'admin': req.admin
		});
	});

	router.get('/admin/music/bands/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		var music = await MusicController.get(req.params.id);

		res.render('admin/view_bands', {
			'title': 'Music | Bands | View',
			'type': 'music',
			'sub': 'bands',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'music': music,
			'admin': req.admin
		});
	});

	router.get('/admin/informative/about', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}
		
		var about = await CmsController.getAboutUsWebAdmin();

		res.render('admin/about_web', {
			'title': 'IFH',
			'type': 'informative',
			'sub': 'about',
			'host': config.pre + req.headers.host,
			'about': about,
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/informative/privacy', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var privacy = await CmsController.getPrivacyPolicyWebAdmin();

		res.render('admin/privacy_web', {
			'title': 'IFH',
			'type': 'informative',
			'sub': 'privacy',
			'host': config.pre + req.headers.host,
			'privacy': privacy,
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/informative/terms', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var terms = await CmsController.getTermsWebAdmin();

		res.render('admin/terms_web', {
			'title': 'IFH',
			'type': 'informative',
			'sub': 'terms',
			'host': config.pre + req.headers.host,
			'terms': terms,
			'access_rights': req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/short_films/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		res.render('admin/add_short_film', {
			'title': 'Short film | Add',
			'type': 'short_film',
			'sub': 'short_film',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'admin': req.admin
		});
	});

	router.get('/admin/short_films/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var shortFilm = await ShortFilmController.get(req.params.id);
		var languages = await LanguageController.getListAdmin();

		if (!shortFilm)
			return res.render('404');

		res.render('admin/view_short_film', {
			'title': 'Short films | View',
			'type': 'short_film',
			'sub': 'short_film',
			'host': config.pre + req.headers.host,
			'short_film': shortFilm,
			'languages': languages,
			'admin': req.admin
		});
	});

	router.get('/admin/short_films/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}
		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}


		var shortFilm = await ShortFilmController.get(req.params.id);
		var languages = await LanguageController.getListAdmin();

		if (!shortFilm)
			return res.render('404');

		res.render('admin/edit_short_film', {
			'title': 'Short films | Edit',
			'type': 'short_film',
			'sub': 'short_film',
			'host': config.pre + req.headers.host,
			'short_film': shortFilm,
			'languages': languages,
			'celebritySearch': [],
			'admin': req.admin
		});
	});

	router.get('/admin/theatre/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		var languages = await LanguageController.getListAdmin();

		res.render('admin/add_theatre', {
			'title': 'Theater | Add',
			'type': 'theatre',
			'sub': 'theatre',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'admin': req.admin
		});
	});

	router.get('/admin/theatre/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var theatre = await TheatreController.get(req.params.id);
		var languages = await LanguageController.getListAdmin();

		if (!theatre)
			return res.render('404');

		res.render('admin/view_theatre', {
			'title': 'Theater | View',
			'type': 'theatre',
			'sub': 'theatre',
			'host': config.pre + req.headers.host,
			'theatre': theatre,
			'languages': languages,
			'admin': req.admin
		});
	});

	router.get('/admin/theatre/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var theatre = await TheatreController.get(req.params.id);
		var languages = await LanguageController.getListAdmin();

		if (!theatre)
			return res.render('404');

		res.render('admin/edit_theatre', {
			'title': 'Theater | Edit',
			'type': 'theatre',
			'sub': 'theatre',
			'host': config.pre + req.headers.host,
			'theatre': theatre,
			'languages': languages,
			'celebritySearch': [],
			'admin': req.admin
		});
	});

	router.get('/admin/web_series/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}


		var languages = await LanguageController.getListAdmin();

		res.render('admin/add_web_series', {
			'title': 'Web series | Add',
			'type': 'webseries',
			'sub': 'webseries',
			'host': config.pre + req.headers.host,
			'languages': languages,
			'admin': req.admin
		});
	});

	router.get('/admin/web_series/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var webSeries = await WebSeriesController.get(req.params.id);
		var languages = await LanguageController.getListAdmin();

		if (!webSeries)
			return res.render('404');

		res.render('admin/view_web_series', {
			'title': 'Web seriess | View',
			'type': 'webseries',
			'sub': 'webseries',
			'host': config.pre + req.headers.host,
			'web_series': webSeries,
			'languages': languages,
			'admin': req.admin
		});
	});

	router.get('/admin/web_series/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}


		var webSeries = await WebSeriesController.get(req.params.id);
		var languages = await LanguageController.getListAdmin();

		if (!webSeries)
			return res.render('404');

		res.render('admin/edit_web_series', {
			'title': 'Web seriess | Edit',
			'type': 'webseries',
			'sub': 'webseries',
			'host': config.pre + req.headers.host,
			'web_series': webSeries,
			'languages': languages,
			'celebritySearch': [],
			'admin': req.admin
		});
	});

	router.get('/admin/news/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		res.render('admin/add_news', {
			'title': 'News | Add',
			'type': 'news',
			'sub': 'news',
			'host': config.pre + req.headers.host,
			'celebritySearch': [],
			'movieSearch': [],
			'admin': req.admin
		});
	});

	router.get('/admin/news/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var news = await NewsController.get(req.params.id);
		var celebritySearch = await CelebrityController.getAll();
		var movieSearch = await MovieController.getAll();

		if (!news)
			return res.render('404');

		res.render('admin/view_news', {
			'title': 'News | View',
			'type': 'news',
			'sub': 'news',
			'host': config.pre + req.headers.host,
			'news': news,
			'celebritySearch': celebritySearch,
			'movieSearch': movieSearch,
			'admin': req.admin
		});
	});

	router.get('/admin/news/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var news = await NewsController.get(req.params.id);

		if (!news)
			return res.render('404');

		res.render('admin/edit_news', {
			'title': 'News | Edit',
			'type': 'news',
			'sub': 'news',
			'host': config.pre + req.headers.host,
			'news': news,
			'celebritySearch': [],
			'movieSearch': [],
			'admin': req.admin
		});
	});

	router.get('/admin/awards', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var awards = await AwardController.getAll();

		res.render('admin/awards', {
			'title': 'Awards',
			'type': 'awards',
			'sub': 'awards',
			'host': config.pre + req.headers.host,
			'awards': awards,
			'admin': req.admin
		});
	});

	router.get('/admin/banners', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var banners = await BannerController.getAll();
		console.log('access rights :: ',req.innerRights);
		res.render('admin/banners', {
			'title': 'Banners',
			'type': 'banners',
			'sub': 'banners',
			'host': config.pre + req.headers.host,
			'banners': banners,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/ads', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var sections = await AdsController.getAllSections();
		
		res.render('admin/ads_section', {
			'title': 'Advertisements',
			'type': 'ads',
			'sub': 'ads',
			'host': config.pre + req.headers.host,
			'sections': sections,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/ads/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}
		
		var ad = false;

		if(req.params){
			ad = await AdsController.getSectionDetail(req.params.id);
		}

		res.render('admin/ads_detail', {
			'title': 'Advertisements',
			'type': 'ads',
			'sub': 'ads',
			'host': config.pre + req.headers.host,
			'ad': ad,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});
	
	router.get('/admin/awards/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var award = await AwardController.getYears(req.params.id);

		res.render('admin/awards_year', {
			'title': award.name + ' | Years',
			'type': 'awards',
			'sub': 'awards',
			'host': config.pre + req.headers.host,
			'award': award,
			'admin': req.admin
		});
	});

	router.get('/admin/awards/:id/:year', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var award = await AwardController.getDetail(req.params.id, req.params.year);

		res.render('admin/awards_detail', {
			'title': award.name + ' | ' + req.params.year,
			'type': 'awards',
			'sub': 'awards',
			'host': config.pre + req.headers.host,
			'award': award,
			'celebritySearch': [],
			'movieSearch': [],
			'admin': req.admin
		});
	});

	router.get('/admin/prime-blogs', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var blogs = await BlogController.getAll('prime');

		res.render('admin/prime_blogs', {
			'title': 'Blogs | Prime blogs',
			'type': 'prime-blogs',
			'sub': 'prime-blogs',
			'host': config.pre + req.headers.host,
			'blogs': blogs,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/prime-blogs/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}
		var blog = await BlogController.get(req.params.id);
		// console.log("BLOG",blog);
		res.render('admin/edit_blog', {
			'title': 'Prime blogs',
			'type': 'prime-blogs',
			'sub': 'prime-blogs',
			'host': config.pre + req.headers.host,
			'blog': blog,
			'admin': req.admin
		});
	});

	router.get('/admin/prime-blogs/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}

		var blog = await BlogController.get(req.params.id);

		res.render('admin/view_blog', {
			'title': 'Prime blogs',
			'type': 'prime-blogs',
			'sub': 'prime-blogs',
			'host': config.pre + req.headers.host,
			'blog': blog,
			'admin': req.admin
		});
	});

	router.get('/admin/admin-blogs', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var blogs = await BlogController.getAll('admin');

		res.render('admin/admin_blogs', {
			'title': 'Blogs | Admin blogs',
			'type': 'admin-blogs',
			'sub': 'admin-blogs',
			'host': config.pre + req.headers.host,
			'blogs': blogs,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/admin-blogs/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		res.render('admin/add_blog', {
			'title': 'Admin blogs | Add',
			'type': 'admin-blogs',
			'sub': 'admin-blogs',
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/admin-blogs/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var blog = await BlogController.get(req.params.id);

		res.render('admin/edit_blog', {
			'title': 'Admin blogs',
			'type': 'admin-blogs',
			'sub': 'admin-blogs',
			'host': config.pre + req.headers.host,
			'blog': blog,
			'admin': req.admin
		});
	});

	router.get('/admin/admin-blogs/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}
		var blog = await BlogController.get(req.params.id);

		res.render('admin/view_blog', {
			'title': 'Admin blogs',
			'type': 'admin-blogs',
			'sub': 'admin-blogs',
			'host': config.pre + req.headers.host,
			'blog': blog,
			'admin': req.admin
		});
	});

	//Genre Router
	router.get('/admin/genre', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var genre = await GenreController.getGenreListAdminAll();
		res.render('admin/genre', {
			'title': 'Genre',
			'type': 'genre',
			'sub': 'genre',
			'host': config.pre + req.headers.host,
			'genre': genre,
			'admin': req.admin
		});
	});

	//Genre Router
	router.get('/admin/categories', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var categories = await CategoryController.getListAdmin();
		var main_categories = await CategoryController.mainlistGet();
		
		res.render('admin/categories', {
			'title': 'Categories',
			'type': 'categories',
			'sub': 'categories',
			'host': config.pre + req.headers.host,
			'categories': categories,
			'main_categories':main_categories,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	// Documents
	router.get('/admin/documents', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var documents = await DocumentController.getAll();
		
		res.render('admin/documents', {
			'title': 'Documents',
			'type': 'documents',
			'sub': 'documents',
			'host': config.pre + req.headers.host,
			'documents': documents.list,
			'total': documents.total,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/documents/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		res.render('admin/add_document', {
			'title': 'Documents | Add',
			'type': 'documents',
			'sub': 'documents',
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/documents/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var document = await DocumentController.get(req.params.id,true);
		res.render('admin/view_document', {
			'title': 'Documents | View',
			'type': 'documents',
			'sub': 'documents',
			'host': config.pre + req.headers.host,
			'document':document,
			'admin': req.admin
		});
	});

	router.get('/admin/documents/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}

		var document = await DocumentController.get(req.params.id,false);
		res.render('admin/edit_document', {
			'title': 'Documents | Edit',
			'type': 'documents',
			'sub': 'documents',
			'host': config.pre + req.headers.host,
			'document':document,
			'admin': req.admin
		});
	});

	// Manage Association
	router.get('/admin/association', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var data = await AssociationController.getAllAdmin();
		var lang = await LanguageController.getListAdmin();
		
		res.render('admin/association', {
			'title': 'Manage Association',
			'type': 'Association',
			'sub': 'Association',
			'host': config.pre + req.headers.host,
			'data': data,
			'language': lang,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	router.get('/admin/association/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var data = await AssociationController.getYears(req.params.id);
		
		res.render('admin/association_year', {
			'title': data.name + ' | Association - Years',
			'type': 'association',
			'sub': 'association',
			'host': config.pre + req.headers.host,
			'assoc': data,
			'admin': req.admin
		});
	});

	router.get('/admin/association/:id/:year', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		let data = {};

		let assoc = await AssociationController.getAssocYearDetail(req.params.id, req.params.year);
		let membersSearch = await AssociationController.getIFHSourceAndCelebList(req,res);
		let designationSearch = await AssociationController.getAllDesignationAdmin(req,res);
		
		data.members = await AssociationController.getAllAssocMembersAdmin(req,res);
		data.gallery = await AssociationController.getAllAssocGalleryAdmin(req,res);
		data.lastPriority = await AssociationController.getLastPriorityAdmin(req,res);

		res.render('admin/association_detail', {
			'title': assoc.name + ' | Association - ' + req.params.year,
			'type': 'association',
			'sub': 'association',
			'host': config.pre + req.headers.host,
			'assoc': assoc,
			'designationSearch': designationSearch.list,
			'data': data,
			'admin': req.admin
		});
	});
	
	router.get('/admin/testimonial/', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		let data = {};

		data.testimonial = await TestimonialController.getAllAdmin(req, res);
		
		res.render('admin/testimonial', {
			'title': 'Testimonial',
			'type': 'testimonial',
			'sub': 'testimonial',
			'host': config.pre + req.headers.host,
			'data': data,
			'admin': req.admin
		});
	});

	router.post("/admin/association-ajax-gallery",async function(req,res){
		return AssociationController.getAllAssocGalleryAjaxAdmin(req,res);
	});
	
	router.post("/admin/association-ajax-members",async function(req,res){
		return AssociationController.getAllAssocMembersAjaxAdmin(req,res);
	});
	
	
	// Manage Association Designation
	router.get('/admin/association-designation', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var data = await AssociationController.getAllDesignationAdmin();
		
		res.render('admin/association_designation', {
			'title': 'Manage Designation',
			'type': 'designation',
			'sub': 'Designation',
			'host': config.pre + req.headers.host,
			'data': data.list,
			'total': data.total,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});
	
	// Manage Profession
	router.get('/admin/profession', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var data = await ProfessionController.getAllAdmin();
		var dataAll = await ProfessionController.getAllForEditModalAdmin();
		
		res.render('admin/profession', {
			'title': 'Manage Profession',
			'type': 'profession',
			'sub': 'profession',
			'host': config.pre + req.headers.host,
			'data': data.list,
			'data_all': dataAll.list, //for edit modal after pagination
			'total': data.total,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});
	
	// Production House 
	router.get('/admin/production-house', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var productionHouses = await ProductionHouseController.getAll();
		
		res.render('admin/production_houses', {
			'title': 'Production houses',
			'type': 'production-house',
			'sub': 'production-house',
			'host': config.pre + req.headers.host,
			'productionHouses': productionHouses.list,
			'total': productionHouses.total,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});
	
	router.get('/admin/production-house/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.add_rights){
			return res.redirect('/admin/dashboard');
		}

		res.render('admin/add_production_house', {
			'title': 'Production House | Add',
			'type': 'production-house',
			'sub': 'production-house',
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/production-house/view/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.detail_rights){
			return res.redirect('/admin/dashboard');
		}
		var productionHouse = await ProductionHouseController.get(req.params.id);

		if (!productionHouse)
			return res.render('404');

		res.render('admin/view_production_house', {
			'title': 'Theater | View',
			'title': 'Theater | View',
			'type': 'production-house',
			'sub': 'production-house',
			'host': config.pre + req.headers.host,
			'productionHouse': productionHouse,
			'admin': req.admin
		});
	});

	router.get('/admin/production-house/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.update_rights){
			return res.redirect('/admin/dashboard');
		}


		var productionHouse = await ProductionHouseController.get(req.params.id);

		if (!productionHouse)
			return res.render('404');

		res.render('admin/edit_production_house', {
			'title': 'Theater | View',
			'type': 'production-house',
			'sub': 'production-house',
			'host': config.pre + req.headers.host,
			'productionHouse': productionHouse,
			'admin': req.admin
		});
	});


	//Channels Router
	router.get('/admin/television/channels', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

		var channels = await TvController.getChannelsAdmin();
		res.render('admin/channels', {
			'title': 'Channels',
			'type': 'television',
			'sub': 'channels',
			'host': config.pre + req.headers.host,
			'channels': channels,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});

	// POST IFH	
	router.post('/admin/add_on_fire', Service.authenticateAdmin, async function (req, res) {
		return MovieController.addOnFire(req, res);
	});

	router.post('/admin/add_on_air', Service.authenticateAdmin, async function (req, res) {
		return MovieController.addOnAir(req, res);
	});

	router.post('/admin/add_movie', Service.authenticateAdmin, async function (req, res) {
		return MovieController.add(req, res);
	});

	router.post('/admin/update_movie', Service.authenticateAdmin, async function (req, res) {
		return MovieController.update(req, res);
	});

	router.post('/admin/update_movie_video', Service.authenticateAdmin, async function (req, res) {
		return MovieController.updateVideo(req, res);
	});

	router.post('/admin/update_movie_homepage_preferences', Service.authenticateAdmin, async function (req, res) {
		return MovieController.updateHomepagePreferences(req, res);
	});

	router.post('/admin/update_movie_cast', Service.authenticateAdmin, async function (req, res) {
		return MovieController.updateCast(req, res);
	});

	router.post('/admin/remove_on_fire', Service.authenticateAdmin, async function (req, res) {
		return MovieController.removeOnFire(req, res);
	});

	router.post('/admin/remove_on_air', Service.authenticateAdmin, async function (req, res) {
		return MovieController.removeOnAir(req, res);
	});

	router.post('/admin/remove_movie', Service.authenticateAdmin, async function (req, res) {
		return MovieController.remove(req, res);
	});

	router.post('/admin/add_top_rated', Service.authenticateAdmin, async function (req, res) {
		return MovieController.addTopRated(req, res);
	});

	router.post('/admin/remove_top_rated', Service.authenticateAdmin, async function (req, res) {
		return MovieController.removeTopRated(req, res);
	});

	router.post('/admin/add_top_celeb', Service.authenticateAdmin, async function (req, res) {
		return CelebrityController.addTop(req, res);
	});

	router.post('/admin/add_popular_celeb', Service.authenticateAdmin, async function (req, res) {
		return CelebrityController.addPopular(req, res);
	});

	router.post('/admin/remove_top_celeb', Service.authenticateAdmin, async function (req, res) {
		return CelebrityController.removeTop(req, res);
	});

	router.post('/admin/remove_popular_celeb', Service.authenticateAdmin, async function (req, res) {
		return CelebrityController.removePopular(req, res);
	});

	router.post('/admin/add_image', Service.authenticateAdmin, async function (req, res) {
		return GalleryController.addImage(req, res);
	});

	router.post('/admin/delete_gallery_image', Service.authenticateAdmin, async function (req, res) {
		return GalleryController.removeImage(req, res);
	});

	router.post('/admin/add_video', Service.authenticateAdmin, async function (req, res) {
		return GalleryController.addVideo(req, res);
	});

	router.post('/admin/delete_gallery_video', Service.authenticateAdmin, async function (req, res) {
		return GalleryController.removeVideo(req, res);
	});

	router.post('/admin/update_cms_about_web', Service.authenticateAdmin, async function (req, res) {
		return CmsController.updateAboutUsWeb(req, res);
	});

	router.post('/admin/update_cms_terms_web', Service.authenticateAdmin, async function (req, res) {
		return CmsController.updateTermsWeb(req, res);
	});

	router.post('/admin/update_cms_privacy_web', Service.authenticateAdmin, async function (req, res) {
		return CmsController.updatePrivacyWeb(req, res);
	});

	router.post('/admin/update_prime_credits', Service.authenticateAdmin, async function (req, res) {
		return DefaultController.setprimeCredits(req, res);
	});

	router.post('/admin/update_plan_state', Service.authenticateAdmin, async function (req, res) {
		return SubscriptionController.updateState(req, res);
	});

	router.post('/admin/delete_plan', Service.authenticateAdmin, async function (req, res) {
		return SubscriptionController.deletePlan(req, res);
	});

	router.post('/admin/add_plan', Service.authenticateAdmin, async function (req, res) {
		return SubscriptionController.addPlan(req, res);
	});

	router.post('/admin/add_tvcom', Service.authenticateAdmin, async function (req, res) {
		return TvComController.add(req, res);
	});

	router.post('/admin/delete_tvcom', Service.authenticateAdmin, async function (req, res) {
		return TvComController.delete(req, res);
	});

	router.post('/admin/add_category_tvcom', Service.authenticateAdmin, async function (req, res) {
		return TvComController.addCategory(req, res);
	});

	router.post('/admin/delete_category_tvcom', Service.authenticateAdmin, async function (req, res) {
		return TvComController.removeCategory(req, res);
	});
    
    router.post('/admin/add_category_magazine', Service.authenticateAdmin, async function (req, res) {
		return MagazineController.addCategory(req, res);
	});

	router.post('/admin/delete_category_magazine', Service.authenticateAdmin, async function (req, res) {
		return MagazineController.removeCategory(req, res);
	});

	router.post('/admin/add_print_media', Service.authenticateAdmin, async function (req, res) {
		return PrintMediaController.add(req, res);
	});

	router.post('/admin/delete_print_media', Service.authenticateAdmin, async function (req, res) {
		return PrintMediaController.delete(req, res);
	});

	router.post('/admin/add_category_print_media', Service.authenticateAdmin, async function (req, res) {
		return PrintMediaController.addCategory(req, res);
	});

	router.post('/admin/delete_category_print_media', Service.authenticateAdmin, async function (req, res) {
		return PrintMediaController.removeCategory(req, res);
	});

	router.post('/admin/add_magazine', Service.authenticateAdmin, async function (req, res) {
		return MagazineController.add(req, res);
	});

	router.post('/admin/delete_magazine', Service.authenticateAdmin, async function (req, res) {
		return MagazineController.delete(req, res);
	});

	router.post('/admin/add_celebrity', Service.authenticateAdmin, async function (req, res) {
		return CelebrityController.add(req, res);
	});

	router.post('/admin/update_celebrity', Service.authenticateAdmin, async function (req, res) {
		return CelebrityController.update(req, res);
	});
    
    router.post('/admin/update_celeb_image', Service.authenticateAdmin, function (req, res) {
		return CelebrityController.updateImage(req, res);
	});

	router.post('/admin/delete_celebrity', Service.authenticateAdmin, async function (req, res) {
		return CelebrityController.delete(req, res);
	});

	router.post('/admin/add_project', Service.authenticateAdmin, function (req, res) {
		return UserController.addProjectFromAdmin(req, res);
	});

	router.post('/admin/update_project', Service.authenticateAdmin, function (req, res) {
		return UserController.updateProjectFromAdmin(req, res);
	});

	router.post('/admin/delete_project', Service.authenticateAdmin, function (req, res) {
		return UserController.deleteProjectFromAdmin(req, res);
	});

	router.post('/admin/add_academic', Service.authenticateAdmin, function (req, res) {
		return UserController.addAcademicFromAdmin(req, res);
	});

	router.post('/admin/update_academic', Service.authenticateAdmin, function (req, res) {
		return UserController.updateAcademicFromAdmin(req, res);
	});

	router.post('/admin/delete_academic', Service.authenticateAdmin, function (req, res) {
		return UserController.deleteAcademicFromAdmin(req, res);
	});

	router.post('/admin/add_team_member', Service.authenticateAdmin, function (req, res) {
		return UserController.addMemberFromAdmin(req, res);
	});

	router.post('/admin/update_team_member', Service.authenticateAdmin, function (req, res) {
		return UserController.updateMemberFromAdmin(req, res);
	});

	router.post('/admin/delete_team_member', Service.authenticateAdmin, function (req, res) {
		return UserController.deleteMemberFromAdmin(req, res);
	});

	router.post('/admin/add_gallery', Service.authenticateAdmin, function (req, res) {
		return UserController.addGalleryFromAdmin(req, res);
	});
	
	router.post('/admin/remove_gallery', Service.authenticateAdmin, function (req, res) {
		return UserController.removeGalleryFromAdmin(req, res);
	});

	router.post('/admin/add_equipment', Service.authenticateAdmin, function (req, res) {
		return UserController.addEquipmentFromAdmin(req, res);
	});

	router.post('/admin/update_equipment', Service.authenticateAdmin, function (req, res) {
		return UserController.updateEquipmentFromAdmin(req, res);
	});

	router.post('/admin/delete_equipment', Service.authenticateAdmin, function (req, res) {
		return UserController.deleteEquipmentFromAdmin(req, res);
	});

	router.post('/admin/add_prop', Service.authenticateAdmin, function (req, res) {
		return UserController.addPropFromAdmin(req, res);
	});

	router.post('/admin/update_prop', Service.authenticateAdmin, function (req, res) {
		return UserController.updatePropFromAdmin(req, res);
	});

	router.post('/admin/delete_prop', Service.authenticateAdmin, function (req, res) {
		return UserController.deletePropFromAdmin(req, res);
	});

	router.post('/admin/add_location', Service.authenticateAdmin, function (req, res) {
		return UserController.addLocationFromAdmin(req, res);
	});

	router.post('/admin/update_location', Service.authenticateAdmin, function (req, res) {
		return UserController.updateLocationFromAdmin(req, res);
	});

	router.post('/admin/delete_location', Service.authenticateAdmin, function (req, res) {
		return UserController.deleteLocationFromAdmin(req, res);
	});

	router.post('/admin/remove_gallery_celebrity', Service.authenticateAdmin, function (req, res) {
		return CelebrityController.removeGalleryFromAdmin(req, res);
	});

	router.post('/admin/remove_project_celebrity', Service.authenticateAdmin, function (req, res) {
		return CelebrityController.removeProjectFromAdmin(req, res);
	});

	router.post('/admin/update_project_celeb', Service.authenticateAdmin, function (req, res) {
		return CelebrityController.updateProjectFromAdmin(req, res);
	});

	router.post('/admin/update_movie_state', Service.authenticateAdmin, async function (req, res) {
		return MovieController.updateState(req, res);
	});

	router.post('/admin/remove_movie_video', Service.authenticateAdmin, function (req, res) {
		return MovieController.removeVideo(req, res);
	});

	router.post('/admin/remove_celeb_video', Service.authenticateAdmin, function (req, res) {
		return CelebrityController.removeVideo(req, res);
	});

	router.post('/admin/add_movie_image', Service.authenticateAdmin, function (req, res) {
		return MovieController.addImage(req, res);
	});

	router.post('/admin/update_movie_image', Service.authenticateAdmin, function (req, res) {
		return MovieController.updateImage(req, res);
	});

	router.post('/admin/remove_movie_image', Service.authenticateAdmin, function (req, res) {
		return MovieController.removeImage(req, res);
	});

	router.post('/admin/remove_movie_trailer', Service.authenticateAdmin, function (req, res) {
		return MovieController.removeTrailerPicture(req, res);
	});

	router.post('/admin/add_critic', Service.authenticateAdmin, function (req, res) {
		return MovieController.addCritic(req, res);
	});

	router.post('/admin/update_critic', Service.authenticateAdmin, function (req, res) {
		return MovieController.updateCritic(req, res);
	});

	router.post('/admin/remove_critic', Service.authenticateAdmin, function (req, res) {
		return MovieController.removeCritic(req, res);
	});

	router.post('/admin/add_bo', Service.authenticateAdmin, function (req, res) {
		return MovieController.addBo(req, res);
	});

	router.post('/admin/update_bo', Service.authenticateAdmin, function (req, res) {
		return MovieController.updateBo(req, res);
	});

	router.post('/admin/remove_bo', Service.authenticateAdmin, function (req, res) {
		return MovieController.removeBo(req, res);
	});

	router.post('/admin/add_music_movie', Service.authenticateAdmin, function (req, res) {
		return MovieController.addMusic(req, res);
	});

	router.post('/admin/update_music_movie', Service.authenticateAdmin, function (req, res) {
		return MovieController.updateMusic(req, res);
	});

	router.post('/admin/remove_music_movie', Service.authenticateAdmin, function (req, res) {
		return MovieController.removeMusic(req, res);
	});

	router.post('/admin/movie/sheet_verify', Service.authenticateAdmin, async function (req, res) {
		req.body.verify = true;
		return MovieController.addFromSheet(req, res);
	});

	router.post('/admin/movie/sheet_upload', Service.authenticateAdmin, async function (req, res) {
		req.body.verify = false;
		return MovieController.addFromSheet(req, res);
	});

	router.post('/admin/celebrity/sheet_verify', Service.authenticateAdmin, async function (req, res) {
		req.body.verify = true;
		return CelebrityController.addFromSheet(req, res);
	});

	router.post('/admin/celebrity/sheet_upload', Service.authenticateAdmin, async function (req, res) {
		req.body.verify = false;
		return CelebrityController.addFromSheet(req, res);
	});

	router.get('/admin/movies/download_sheet', Service.authenticateAdmin, async function (req, res) {
		var file = './public/movies.xlsx';
		res.download(file);
	});

	router.get('/admin/celebrities/download_sheet', Service.authenticateAdmin, async function (req, res) {
		var file = './public/celebrity.xlsx';
		res.download(file);
	});

	router.post('/admin/review_response', Service.authenticateAdmin, async function (req, res) {
		req.body.verify = false;
		return MovieController.reviewResponse(req, res);
	});

	router.post('/admin/review_response_theatre', Service.authenticateAdmin, async function (req, res) {
		req.body.verify = false;
		return TheatreController.reviewResponse(req, res);
	});

	router.post('/admin/review_response_short_film', Service.authenticateAdmin, async function (req, res) {
		req.body.verify = false;
		return ShortFilmController.reviewResponse(req, res);
	});

	router.post('/admin/review_response_web_series', Service.authenticateAdmin, async function (req, res) {
		req.body.verify = false;
		return WebSeriesController.reviewResponse(req, res);
	});

	router.post('/admin/review_response_tvc', Service.authenticateAdmin, async function (req, res) {
		req.body.verify = false;
		return TvComController.reviewResponse(req, res);
	});		

	router.post('/admin/add_short_film', Service.authenticateAdmin, async function (req, res) {
		return ShortFilmController.add(req, res);
	});

	router.post('/admin/update_short_film', Service.authenticateAdmin, async function (req, res) {
		return ShortFilmController.update(req, res);
	});

	router.post('/admin/update_short_film_video', Service.authenticateAdmin, async function (req, res) {
		return ShortFilmController.updateVideo(req, res);
	});

	router.post('/admin/update_short_film_cast', Service.authenticateAdmin, async function (req, res) {
		return ShortFilmController.updateCast(req, res);
	});

	router.post('/admin/remove_short_film_video', Service.authenticateAdmin, function (req, res) {
		return ShortFilmController.removeVideo(req, res);
	});

	router.post('/admin/remove_short_film_trailer', Service.authenticateAdmin, function (req, res) {
		return ShortFilmController.removeTrailerPicture(req, res);
	});

	router.post('/admin/remove_short_film', Service.authenticateAdmin, async function (req, res) {
		return ShortFilmController.remove(req, res);
	});

	router.post('/admin/add_theatre', Service.authenticateAdmin, async function (req, res) {
		return TheatreController.add(req, res);
	});

	router.post('/admin/update_theatre', Service.authenticateAdmin, async function (req, res) {
		return TheatreController.update(req, res);
	});

	router.post('/admin/update_theatre_video', Service.authenticateAdmin, async function (req, res) {
		return TheatreController.updateVideo(req, res);
	});	

	router.post('/admin/update_theatre_cast', Service.authenticateAdmin, async function (req, res) {
		return TheatreController.updateCast(req, res);
	});

	router.post('/admin/remove_theatre_trailer', Service.authenticateAdmin, function (req, res) {
		return TheatreController.removeTrailerPicture(req, res);
	});

	router.post('/admin/remove_theatre', Service.authenticateAdmin, async function (req, res) {
		return TheatreController.remove(req, res);
	});

	router.post('/admin/add_web_series', Service.authenticateAdmin, async function (req, res) {
		return WebSeriesController.add(req, res);
	});

	router.post('/admin/update_web_series', Service.authenticateAdmin, async function (req, res) {
		return WebSeriesController.update(req, res);
	});

	router.post('/admin/update_web_series_video', Service.authenticateAdmin, async function (req, res) {
		return WebSeriesController.updateVideo(req, res);
	});

	router.post('/admin/update_web_series_episode', Service.authenticateAdmin, async function (req, res) {
		return WebSeriesController.updateEpisode(req, res);
	});

	router.post('/admin/update_web_series_cast', Service.authenticateAdmin, async function (req, res) {
		return WebSeriesController.updateCast(req, res);
	});

	router.post('/admin/remove_web_series_video', Service.authenticateAdmin, function (req, res) {
		return WebSeriesController.removeVideo(req, res);
	});

	router.post('/admin/remove_web_series_trailer', Service.authenticateAdmin, function (req, res) {
		return WebSeriesController.removeTrailerPicture(req, res);
	});
	
	router.post('/admin/remove_web_series_episode', Service.authenticateAdmin, function (req, res) {
		return WebSeriesController.removeEpisode(req, res);
	});

	router.post('/admin/remove_web_series', Service.authenticateAdmin, async function (req, res) {
		return WebSeriesController.remove(req, res);
	});

	router.post('/admin/add_news', Service.authenticateAdmin, async function (req, res) {
		return NewsController.add(req, res);
	});

	router.post('/admin/update_news', Service.authenticateAdmin, async function (req, res) {
		return NewsController.update(req, res);
	});

	router.post('/admin/remove_news', Service.authenticateAdmin, async function (req, res) {
		return NewsController.remove(req, res);
	});

	// Testimonial Module
	router.post('/admin/add_testimonial_from_ifh', Service.authenticateAdmin, async function (req, res) {
		return TestimonialController.addTestimonialFromCelebOrSource(req, res);
	});
	
	router.post('/admin/add_testimonial_manual', Service.authenticateAdmin, async function (req, res) {
		return TestimonialController.addTestimonialManually(req, res);
	});
	
	router.post('/admin/remove_testimonial', Service.authenticateAdmin, async function (req, res) {
		return TestimonialController.removeTestimonial(req, res);
	});

	router.post('/admin/add_association_main', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.addAssociationMain(req, res);
	});
	
	router.post('/admin/update_association_main', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.updateAssociationMain(req, res);
	});
	
	router.post('/admin/remove_association_main', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.removeAssociationMain(req, res);
	});
	
	router.post('/admin/add_association_member', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.addAssociationMemberFromIFHSourceOrCeleb(req, res);
	});
	
	router.post('/admin/add_association_member_manually', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.addAssociationMemberManually(req, res);
	});
	
	router.post('/admin/update_association_member_manually', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.updateAssociationMemberManually(req, res);
	});
	
	router.post('/admin/update_association_member', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.updateAssociationMember(req, res);
	});

	router.post('/admin/remove_association_member', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.removeAssociationMemberMain(req, res);
	});

	router.post('/admin/add_association_gallery', Service.authenticateAdmin, function (req, res) {
		return AssociationController.addGalleryFromAdmin(req, res);
	});
	
	router.post('/admin/remove_association_gallery', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.removeGalleryFromAdmin(req, res);
	});
	
	router.post('/admin/add_award_main', Service.authenticateAdmin, async function (req, res) {
		return AwardController.addAwardMain(req, res);
	});

	router.post('/admin/update_award_main', Service.authenticateAdmin, async function (req, res) {
		return AwardController.updateAwardMain(req, res);
	});

	router.post('/admin/remove_award_main', Service.authenticateAdmin, async function (req, res) {
		return AwardController.removeAwardMain(req, res);
	});

	router.post('/admin/add_association_year', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.addAssociationYear(req, res);
	});
	
	router.post('/admin/update_association_year', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.updateAssociationYear(req, res);
	});

	router.post('/admin/remove_association_year', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.removeAssociationYear(req, res);
	});

	router.post('/admin/add_award_year', Service.authenticateAdmin, async function (req, res) {
		return AwardController.addAwardYear(req, res);
	});

	router.post('/admin/update_award_year', Service.authenticateAdmin, async function (req, res) {
		return AwardController.updateAwardYear(req, res);
	});
	
	router.post('/admin/remove_award_year', Service.authenticateAdmin, async function (req, res) {
		return AwardController.removeAwardYear(req, res);
	});

	router.post('/admin/add_award_detail', Service.authenticateAdmin, async function (req, res) {
		return AwardController.addAwardDetail(req, res);
	});

	router.post('/admin/update_award_detail', Service.authenticateAdmin, async function (req, res) {
		return AwardController.updateAwardDetail(req, res);
	});

	router.post('/admin/remove_award_detail', Service.authenticateAdmin, async function (req, res) {
		return AwardController.removeAwardDetail(req, res);
	});

	router.post('/admin/add_show', Service.authenticateAdmin, async function (req, res) {
		req.body.type = 'show';
		return TvController.add(req, res);
	});

	router.post('/admin/update_show', Service.authenticateAdmin, async function (req, res) {
		return TvController.update(req, res);
	});

	router.post('/admin/update_show_video', Service.authenticateAdmin, async function (req, res) {
		return TvController.updateVideo(req, res);
	});

	router.post('/admin/update_show_cast', Service.authenticateAdmin, async function (req, res) {
		return TvController.updateCast(req, res);
	});

	router.post('/admin/remove_show', Service.authenticateAdmin, async function (req, res) {
		return TvController.delete(req, res);
	});

	router.post('/admin/remove_show_video', Service.authenticateAdmin, async function (req, res) {
		return TvController.removeVideo(req, res);
	});

	router.post('/admin/add_show_image', Service.authenticateAdmin, function (req, res) {
		return TvController.addImage(req, res);
	});

	router.post('/admin/remove_show_image', Service.authenticateAdmin, function (req, res) {
		return TvController.removeImage(req, res);
	});

	router.post('/admin/remove_show_trailer', Service.authenticateAdmin, function (req, res) {
		return TvController.removeTrailerPicture(req, res);
	});

	router.post('/admin/add_reality', Service.authenticateAdmin, async function (req, res) {
		req.body.type = 'reality';
		return TvController.add(req, res);
	});

	router.post('/admin/update_reality', Service.authenticateAdmin, async function (req, res) {
		return TvController.update(req, res);
	});

	router.post('/admin/update_reality_video', Service.authenticateAdmin, async function (req, res) {
		return TvController.updateVideo(req, res);
	});

	router.post('/admin/update_reality_cast', Service.authenticateAdmin, async function (req, res) {
		return TvController.updateCast(req, res);
	});

	router.post('/admin/remove_reality', Service.authenticateAdmin, async function (req, res) {
		return TvController.delete(req, res);
	});

	router.post('/admin/remove_reality_video', Service.authenticateAdmin, async function (req, res) {
		return TvController.removeVideo(req, res);
	});

	router.post('/admin/add_reality_image', Service.authenticateAdmin, function (req, res) {
		return TvController.addImage(req, res);
	});

	router.post('/admin/remove_reality_image', Service.authenticateAdmin, function (req, res) {
		return TvController.removeImage(req, res);
	});

	router.post('/admin/add_musicI', Service.authenticateAdmin, async function (req, res) {
		req.body.type = 'independent';
		return MusicController.add(req, res);
	});

	router.post('/admin/update_musicI', Service.authenticateAdmin, async function (req, res) {
		return MusicController.update(req, res);
	});

	router.post('/admin/add_musicC', Service.authenticateAdmin, async function (req, res) {
		req.body.type = 'classical';
		return MusicController.add(req, res);
	});

	router.post('/admin/update_musicC', Service.authenticateAdmin, async function (req, res) {
		return MusicController.update(req, res);
	});

	router.post('/admin/add_musicR', Service.authenticateAdmin, async function (req, res) {
		req.body.type = 'rock-bands';
		return MusicController.add(req, res);
	});

	router.post('/admin/update_musicR', Service.authenticateAdmin, async function (req, res) {
		return MusicController.update(req, res);
	});

	router.post('/admin/add_musicB', Service.authenticateAdmin, async function (req, res) {
		req.body.type = 'bands';
		return MusicController.add(req, res);
	});

	router.post('/admin/update_musicB', Service.authenticateAdmin, async function (req, res) {
		return MusicController.update(req, res);
	});

	router.post('/admin/add_musicY', Service.authenticateAdmin, async function (req, res) {
		req.body.type = 'youtube';
		return MusicController.add(req, res);
	});

	router.post('/admin/update_musicY', Service.authenticateAdmin, async function (req, res) {
		return MusicController.update(req, res);
	});

	router.post('/admin/remove_music', Service.authenticateAdmin, async function (req, res) {
		return MusicController.remove(req, res);
	});

	router.post('/admin/add_music_musicI', Service.authenticateAdmin, function (req, res) {
		return MusicController.addMusic(req, res);
	});

	router.post('/admin/add_music_musicC', Service.authenticateAdmin, function (req, res) {
		return MusicController.addMusic(req, res);
	});

	router.post('/admin/add_music_musicB', Service.authenticateAdmin, function (req, res) {
		return MusicController.addMusic(req, res);
	});

	router.post('/admin/add_music_musicR', Service.authenticateAdmin, function (req, res) {
		return MusicController.addMusic(req, res);
	});

	router.post('/admin/update_music_music', Service.authenticateAdmin, function (req, res) {
		return MusicController.updateMusic(req, res);
	});

	router.post('/admin/remove_music_music', Service.authenticateAdmin, function (req, res) {
		return MusicController.removeMusic(req, res);
	});

	router.post('/admin/update_music_video', Service.authenticateAdmin, async function (req, res) {
		return MusicController.updateVideo(req, res);
	});

	router.post('/admin/remove_music_video', Service.authenticateAdmin, function (req, res) {
		return MusicController.removeVideo(req, res);
	});

	router.post('/admin/add_banner_main', Service.authenticateAdmin, async function (req, res) {
		return BannerController.addBanner(req, res);
	});

	router.post('/admin/update_banner_main', Service.authenticateAdmin, async function (req, res) {
		return BannerController.updateBanner(req, res);
	});

	router.post('/admin/get_banner_detail_by_id', Service.authenticateAdmin, async function (req, res) {
		return BannerController.getBannerDetail(req, res);
	});

	router.post('/admin/remove_banner_main', Service.authenticateAdmin, async function (req, res) {
		return BannerController.removeBanner(req, res);
	});

	router.post('/admin/banner_change_status', Service.authenticateAdmin, async function (req, res) {
		return BannerController.changeStatus(req, res);
	});

	router.post('/admin/add_blog', Service.authenticateAdmin, async function (req, res) {
		return BlogController.add(req, res);
	});

	router.post('/admin/update_blog', Service.authenticateAdmin, async function (req, res) {
		return BlogController.update(req, res);
	});

	router.post('/admin/remove_blog', Service.authenticateAdmin, async function (req, res) {
		return BlogController.remove(req, res);
	});

	router.post('/admin/update_blog_state', Service.authenticateAdmin, async function (req, res) {
		return BlogController.updateState(req, res);
	});

	router.post('/admin/update_blog_status', Service.authenticateAdmin, async function (req, res) {
		return BlogController.updateStatus(req, res);
	});

	router.post('/admin/update_blog_comment_status', Service.authenticateAdmin, function (req, res) {
		return BlogController.updateStateComment(req, res);
	});

	//Update Lanugae Status
	router.post('/admin/update_language_state', Service.authenticateAdmin, async function (req, res) {
		return LanguageController.updateState(req, res);
	});

	//Update Genre Status
	router.post('/admin/update_genre_state', Service.authenticateAdmin, async function (req, res) {
		return GenreController.updateGenreState(req, res);
	});

	//Update Channesl Status 
	router.post('/admin/update_channels_state', Service.authenticateAdmin, async function (req, res) {
		return TvController.updateChannelsState(req, res);
	});
	
	//Add Language
	router.post('/admin/add_language', Service.authenticateAdmin, async function (req, res) {
		return LanguageController.addLanguage(req, res);
	});

	//Add Genre
	router.post('/admin/add_genre', Service.authenticateAdmin, async function (req, res) {
		return GenreController.addGenre(req, res);
	});
	
	//Add Designation
	router.post('/admin/add_designation', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.addDesignation(req, res);
	});
	
	//Edit Designation
	router.post('/admin/edit_designation', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.editDesignation(req, res);
	});
	
	//Delete Designation
	router.post('/admin/delete_designation', Service.authenticateAdmin, async function (req, res) {
		return AssociationController.removeDesignation(req, res);
	});
	
	//Add Profession
	router.post('/admin/add_profession', Service.authenticateAdmin, async function (req, res) {
		return ProfessionController.addProfession(req, res);
	});
	
	//Edit Profession
	router.post('/admin/edit_profession', Service.authenticateAdmin, async function (req, res) {
		return ProfessionController.editProfession(req, res);
	});
	
	//Delete Profession
	router.post('/admin/delete_profession', Service.authenticateAdmin, async function (req, res) {
		return ProfessionController.removeProfession(req, res);
	});

	// CATEGORIES
	router.post('/admin/add_category', Service.authenticateAdmin, async function (req, res) {
		return CategoryController.add(req, res);
	});

	router.post('/admin/update_category', Service.authenticateAdmin, async function (req, res) {
		return CategoryController.update(req, res);
	});

	router.post('/admin/delete_category', Service.authenticateAdmin, async function (req, res) {
		return CategoryController.delete(req, res);
	});

	router.post('/admin/update_category_state', Service.authenticateAdmin, async function (req, res) {
		return CategoryController.changeStatus(req, res);
	});

	//Add Channels 	
	router.post('/admin/add_channels', Service.authenticateAdmin, async function (req, res) {
		return TvController.addChannelsAdmin(req, res);
	});

	router.get('/admin/movie_get_ajax', Service.authenticateAdmin, async function (req, res) {
		return MovieController.getMoviesAjax(req, res);
	});

	router.get('/admin/celeb_get_ajax', Service.authenticateAdmin, async function (req, res) {
		return CelebrityController.getCelebsAjax(req, res);
	});

	router.get('/admin/production_house_get_ajax', Service.authenticateAdmin, async function (req, res) {
		return ProductionHouseController.getPHAjax(req, res);
	});
	
	router.get('/admin/profession_get_ajax', Service.authenticateAdmin, async function (req, res) {
		return ProfessionController.getProfessionAjax(req, res);
	});
	
	router.get('/admin/document_get_ajax', Service.authenticateAdmin, async function (req, res) {
		return DocumentController.getDocumentAjax(req, res);
	});

	router.get('/admin/claim_get_ajax', Service.authenticateAdmin, async function (req, res) {
		return ClaimController.getClaimAjax(req, res);
	});

	router.get('/admin/news_get_ajax', Service.authenticateAdmin, async function (req, res) {
		return NewsController.getNewsAjax(req, res);
	});

	router.get('/admin/search_celeb', Service.authenticateAdmin, async function (req, res) {
		return CelebrityController.searchCeleb(req, res);
	});

	router.get('/admin/search_pro', Service.authenticateAdmin, async function (req, res) {
		return ProductionHouseController.search(req, res);
	});

	router.get('/admin/search_movie', Service.authenticateAdmin, async function (req, res) {
		return MovieController.searchMovie(req, res);
	});
	
	router.get('/admin/search_movie_news', Service.authenticateAdmin, async function (req, res) {
		return MovieController.searchMovieNews(req, res);
	});

	router.get('/admin/search_tv_shows_news', Service.authenticateAdmin, async function (req, res) {
		return TvController.searchForNewsTvShows(req, res);
	});

	router.get('/admin/search_reality_show_news', Service.authenticateAdmin, async function (req, res) {
		return TvController.searchForNewsReality(req, res);
	});

	router.get('/admin/search_web_series_news', Service.authenticateAdmin, async function (req, res) {
		return WebSeriesController.searchForNews(req, res);
	});

	router.get('/admin/search_short_films_news', Service.authenticateAdmin, async function (req, res) {
		return ShortFilmController.searchForNews(req, res);
	});

	router.get('/admin/search_theatre_news', Service.authenticateAdmin, async function (req, res) {
		return TheatreController.searchForNews(req, res);
	});

	router.get('/admin/search_tvc_news', Service.authenticateAdmin, async function (req, res) {
		return TvComController.searchForNews(req, res);
	});


	// ADMIN MANAGEMENT

	// SUB ADMINS
	router.get('/admin/sub-admin', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.admin.allAccess){
			return res.redirect('/admin/dashboard');
		}

		var sub_admins = await SuperAdminController.getAllSubAdmins();

		res.render('admin/sub_admin', {
			'title': 'Manage Sub Admins',
			'type': 'sub-admin',
			'sub': 'sub-admin',
			'sub_admins': sub_admins,	
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/sub-admin/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.admin.allAccess){
			return res.redirect('/admin/dashboard');
		}

		res.render('admin/add_sub_admin', {
			'title': 'Manage Sub Admins | Add',
			'type': 'sub-admin',
			'sub': 'sub-admin',
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/sub-admin/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.admin.allAccess){
			return res.redirect('/admin/dashboard');
		}
		var sub_admin = await SuperAdminController.getSubAdmin(req.params.id);

		res.render('admin/edit_sub_admin', {
			'title': 'Manage Sub Admins | Edit',
			'type': 'sub-admin',
			'sub': 'sub-admin',
			'sub_admin': sub_admin,
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.post('/admin/sub-admin/add', Service.authenticateAdmin, async function (req, res) {
		return SuperAdminController.addSubAdmin(req,res);
	});

	router.post('/admin/sub-admin/update_profile', Service.authenticateAdmin, async function (req, res) {
		return SuperAdminController.updateSubAdminProfile(req,res);
	});

	router.post('/admin/sub-admin/update_password', Service.authenticateAdmin, async function (req, res) {
		return SuperAdminController.updateSubAdminPassword(req,res);
	});

	router.post('/admin/sub-admin/delete', Service.authenticateAdmin, async function (req, res) {
		return SuperAdminController.removeSubAdmin(req,res);
	});
	
	// MODULES
	router.get('/admin/modules', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.admin.allAccess){
			return res.redirect('/admin/dashboard');
		}

		var modules = await ModuleController.getAll(-1);

		res.render('admin/modules', {
			'title': 'Manage Modules',
			'type': 'modules',
			'sub': 'modules',
			'modules': modules,
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/modules/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.admin.allAccess){
			return res.redirect('/admin/dashboard');
		}

		var level1_modules = await ModuleController.getAll(1);
		var level2_modules = await ModuleController.getAll(2);
		console.log("LEVEL 1",level1_modules);
		console.log("LEVEL 2",level2_modules);

		res.render('admin/add_modules', {
			'title': 'Manage Modules | Add',
			'type': 'modules',
			'sub': 'modules',
			'level1_modules':level1_modules,
			'level2_modules':level2_modules,
			'access_types': config.access_types_string,
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/modules/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.admin.allAccess){
			return res.redirect('/admin/dashboard');
		}

		var level1_modules = await ModuleController.getAll(1);
		var level2_modules = await ModuleController.getAll(2);
		var module_detail = await ModuleController.getDetail(req.params.id);
		console.log("LEVEL 1",level1_modules);
		console.log("LEVEL 2",level2_modules);
		console.log("module_detail 2",module_detail);

		res.render('admin/edit_module', {
			'title': 'Manage Modules | Edit',
			'type': 'modules',
			'sub': 'modules',
			'level1_modules':level1_modules,
			'level2_modules':level2_modules,
			'module_detail':module_detail,
			'access_types': config.access_types_string,
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.post('/admin/modules/add', Service.authenticateAdmin, async function (req, res) {
		return ModuleController.add(req,res);
	});

	router.post('/admin/modules/update', Service.authenticateAdmin, async function (req, res) {
		return ModuleController.update(req,res);
	});

	// ROLES
	router.get('/admin/roles', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.admin.allAccess){
			return res.redirect('/admin/dashboard');
		}

		var roles = await RoleController.getList();

		res.render('admin/roles', {
			'title': 'Manage Roles',
			'type': 'roles',
			'sub': 'roles',
			'roles': roles,
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/roles/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.admin.allAccess){
			return res.redirect('/admin/dashboard');
		}

		var modules = await ModuleController.getAllForRole();
		console.log("MODULES",JSON.stringify(modules,undefined,2));

		res.render('admin/add_role', {
			'title': 'Manage Roles | Add',
			'type': 'roles',
			'sub': 'roles',
			'access_types': config.access_types_string,
			'modules': modules,
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/roles/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.admin.allAccess){
			return res.redirect('/admin/dashboard');
		}

		var modules = await ModuleController.getAllForRole();
		var role = await RoleController.getRoleDetail(req.params.id);

		console.log("MODULES",JSON.stringify(modules,undefined,2));
		
		for(var i in modules){
			modules[i].actual_rights = [];
			for(var j = 0; j < role.access.length; j++){
				if(modules[i].id == role.access[j].module){
					modules[i].actual_rights = role.access[j].access;
				}
			}

			for(var k in modules[i].sub_modules){
				modules[i].sub_modules[k].actual_rights = [];
				for(var l = 0; l < role.access.length; l++){
					if(modules[i].sub_modules[k].id == role.access[l].module){
						modules[i].sub_modules[k].actual_rights = role.access[l].access;
					}
				}

				for(var m in modules[i].sub_modules[k].sub_modules){
					modules[i].sub_modules[k].sub_modules[m].actual_rights = [];
					for(var n = 0; n < role.access.length; n++){
						if(modules[i].sub_modules[k].sub_modules[m].id == role.access[n].module){
							modules[i].sub_modules[k].sub_modules[m].actual_rights = role.access[n].access;
						}
					}
				}
	
			}
		}

		// console.log("MODULES",JSON.stringify(modules,undefined,2));

		res.render('admin/edit_role', {
			'title': 'Manage Roles | Edit',
			'type': 'roles',
			'sub': 'roles',
			'role': role,
			'modules': modules,
			'host': config.pre + req.headers.host,
			'access_types': config.access_types_string,
			'admin': req.admin
		});

	});

	router.post('/admin/roles/add', Service.authenticateAdmin, async function (req, res) {
		return RoleController.addRole(req,res);
	});

	router.post('/admin/roles/update', Service.authenticateAdmin, async function (req, res) {
		return RoleController.updateRole(req,res);
	});

	router.post('/admin/roles/delete', Service.authenticateAdmin, async function (req, res) {
		return RoleController.removeRole(req,res);
	});

	// DATA EXECUTIVES
	router.get('/admin/data-executives', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.admin.allAccess){
			return res.redirect('/admin/dashboard');
		}

		var users = await SuperAdminController.getAllDataExecutives();

		res.render('admin/data_executives', {
			'title': 'Manage Data Executives',
			'type': 'data-executives',
			'sub': 'data-executives',
			'users': users,
 			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/data-executives/add', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}
		
		if(!req.admin.allAccess){
			return res.redirect('/admin/dashboard');
		}

		var roles = await RoleController.getList();
		console.log("ROLES",roles);

		res.render('admin/add_data_executive', {
			'title': 'Manage Data Executives | Add',
			'type': 'data-executives',
			'sub': 'data-executives',
			'roles': roles,
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/data-executives/edit/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.admin.allAccess){
			return res.redirect('/admin/dashboard');
		}

		var data_executive = await SuperAdminController.getDataExecutive(req.params.id);
		var roles = await RoleController.getList();

		res.render('admin/edit_data_executive', {
			'title': 'Manage Data Executives | Edit',
			'type': 'data-executives',
			'sub': 'data-executives',
			'data_executive': data_executive,
			'roles': roles,
			'host': config.pre + req.headers.host,
			'admin': req.admin
		});
	});

	router.get('/admin/data-executives/report/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.admin.allAccess){
			return res.redirect('/admin/dashboard');
		}

		var from_date = "";
		var to_date = "";

		if(req.query){
			if(req.query.from && req.query.to){
				// if(Service.valiDate(req.query.from) && Service.valiDate(req.query.to)) {
					if(Date.parse(req.query.to) >= Date.parse(req.query.from)){
						from_date = req.query.from;
						to_date = req.query.to;
					}
				// }
			}
		}
		console.log("FROM :",from_date);
		console.log("TO   :",to_date);

		var data = await SuperAdminController.getDashboardForDatesDE(req,from_date,to_date,req.params.id);
		
		var data_executive = await SuperAdminController.getDataExecutive(req.params.id);

		res.render('admin/report_data_executive', {
			'title': 'Report of '+data_executive.first_name+" "+data_executive.last_name,
			'type': 'data-executives',
			'sub': 'data-executives',
			'data_executive': data_executive,
			'host': config.pre + req.headers.host,
			'data': data,
			'admin': req.admin
		});
	});

	router.get('/admin/reset_password_via_token/:token', async function (req, res) {
		
		var status = await SuperAdminController.checkChangePwdEligible(req.params.token);
		
		console.log('status :: ',status);

		res.render('reset_view_dme_password', {
			'title': 'IFH | Reset Password',
			'type': 'data-executives',
			'sub': 'data-executives',
			'status': status,
			'token': req.params.token,
			'host': config.pre + req.headers.host
		});
	});

	router.post('/admin/data-executives/add', Service.authenticateAdmin, async function (req, res) {
		return SuperAdminController.addDataExecutive(req,res);
	});

	router.post('/admin/data-executives/update_profile', Service.authenticateAdmin, async function (req, res) {
		return SuperAdminController.updateDataExecutiveProfile(req,res);
	});

	router.post('/admin/data-executives/update_password', Service.authenticateAdmin, async function (req, res) {
		return SuperAdminController.updateDataExecutivePassword(req,res);
	});

	router.post('/admin/reset_password_via_token', Service.authenticateAdmin, (req, res) => {
		return SuperAdminController.resetPasswordViaToken(req, res);
	});

	router.post('/admin/data-executives/delete', Service.authenticateAdmin, async function (req, res) {
		return SuperAdminController.removeDataExecutive(req,res);
	});

	router.post('/admin/add_ad', Service.authenticateAdmin, async function (req, res) {
		return AdsController.addAd(req, res);
	});

	router.post('/admin/update_ad', Service.authenticateAdmin, async function (req, res) {
		return AdsController.updateAd(req, res);
	});

	router.post('/admin/remove_ad', Service.authenticateAdmin, async function (req, res) {
		return AdsController.removeAd(req, res);
	});

	router.post('/admin/update_ad_status', Service.authenticateAdmin, async function (req, res) {
		return AdsController.changeStatus(req, res);
	});

	// META SECTION
	router.get('/admin/dynamic-meta', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		// var meta = await MetaController.getAll();
		var categories = await MetaController.getCategories();
		
		res.render('admin/meta', {
			'title': 'Dynamic meta',
			'type': 'dynamic-meta',
			'sub': 'dynamic-meta',
			'host': config.pre + req.headers.host,
			'categories': categories,
			'access_rights':req.innerRights,
			'admin': req.admin
		});
	});
	
	// APP VERSION
	router.get('/admin/app-version', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		var versions = await DefaultController.getAppVersions();

		res.render('admin/app_version', {
			'title': 'App Version',
			'type': 'app-version',
			'sub': 'app-version',
			'host': config.pre + req.headers.host,
			'android_v': versions.android_v,
			'ios_v': versions.ios_v,
			'admin': req.admin
		});
	});

	// Claim page
	router.get('/admin/claim', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

        var claim = await ClaimController.getAll();
        console.log("claim page =>",claim);
		res.render('admin/claim', {
			'title': 'Claim Page',
			'type': 'claim',
			'sub': 'claim',
			'host': config.pre + req.headers.host,
			'claim': claim.list,
			'total': claim.total,
			'default_profile': config.default_user_pic,
			'access_rights':req.innerRights,
			'admin': req.admin
		});

	});
	router.get('/admin/claim/history/:id', Service.authenticateAdmin, async function (req, res) {
		if (!req.auth) {
			return res.redirect('/admin/login');
		}

		if(!req.innerRights.list_rights){
			return res.redirect('/admin/dashboard');
		}

        let view_page = "";
        var claim = await ClaimController.getCelebHistory(req, res);
        
        var profession = await ProfessionController.getlistAdmin();
        console.log("CLAIM=>", claim);
        
        var languages = await LanguageController.getListAdmin('a');
		var indian_languages = await LanguageController.getListAdmin('i');
        var foreign_languages = await LanguageController.getListAdmin('f');
        
        var physique = await PhysiqueController.getListAdmin();

		var activities = await ActivityController.getListAdmin();

		var complexions = await ComplexionController.getListAdmin();
		var eye_colors = await EyeColorController.getListAdmin();
		var hair_colors = await HairColorController.getListAdmin();
		var hair_lengths = await HairLengthController.getListAdmin();

		var project_types = await WorkTypeController.getListAdmin();

        res.render("admin/claim_history", {
			'title': 'Claim History Page',
			'type': 'claim',
			'sub': 'claim',
			"req": req,
			'host': config.pre + req.headers.host,
            'claim': claim.list,
            'total': claim.total,
            'celebrityModel': Celebrity,
            'languages': languages,
			'indian_languages': indian_languages,
            'foreign_languages': foreign_languages,
            'physique': physique,
			'activities': activities,
			'complexions': complexions,
			'eye_colors': eye_colors,
			'hair_colors': hair_colors,
			'hair_lengths': hair_lengths,
            'project_types': project_types,
            'profession': profession,
            'default_profile': config.default_user_pic,
			'access_rights':req.innerRights,
			'admin': req.admin
		});

	});

	router.post('/admin/getMetaPages', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getPages(req, res);
	});
	
	router.get('/admin/getAllCelebAjax', Service.authenticateAdmin, async function (req, res) {
		return CelebrityController.getAllAjaxAdmin(req, res);
	});
	
	router.get('/admin/getIFHSourceAndCelebSearch', Service.authenticateAdmin, async function (req, res) {
		req.body = req.query;
		return AssociationController.getIFHSourceAndCelebList(req, res);
	});
	
	router.get('/admin/getMetaCeleb', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaCelebAdmin(req, res);
	});
	
	router.get('/admin/getMetaMovie', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaMovieAdmin(req, res);
	});
	
	router.get('/admin/getMetaMovieSearch', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaMovieWithYearAdmin(req, res);
	});

	router.get('/admin/getMetaShortFilm', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaShortFilmAdmin(req, res);
	});

	router.get('/admin/getMetaTheatre', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaTheatreAdmin(req, res);
	});

	router.get('/admin/getMetaWebseries', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaWebseriesAdmin(req, res);
	});

	router.get('/admin/getMetaTvc', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaTvcAdmin(req, res);
	});
	router.get('/admin/getMetaShow', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaShowAdmin(req, res);
	});
	router.get('/admin/getMetaRealityShow', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaRealityAdmin(req, res);
	});
	router.get('/admin/getPrintMedia', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaPrintMediaAdmin(req, res);
	});
	router.get('/admin/getMagazineCover', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaMagazineCoverAdmin(req, res);
	});
    
    router.get('/admin/getSubPage', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaSubPageAdmin(req, res);
	});

	router.post('/admin/getMetaValue', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getValue(req, res);
	});

	router.post('/admin/getMetaCelebrityValue', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaCelebrityValue(req, res);
	});

	router.post('/admin/getMetaWebseriesValue', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaWebseriesValue(req, res);
	});

	router.post('/admin/getMetaTvcValue', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaTvcValue(req, res);
	});

	router.post('/admin/getMetaShowValue', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaShowValue(req, res);
	});

	router.post('/admin/getMetaPrintMediaValue', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaPrintMediaValue(req, res);
	});

	router.post('/admin/getMetaMagazineCoverValue', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaMagazineCoverValue(req, res);
	});
    
    router.post('/admin/getMetaSubPageValue', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaSubPageValue(req, res);
	});
    
    router.post('/admin/getMetaIFHSourceListPage', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaIFHSourceListPage(req, res);
	});
    
    router.post('/admin/getMetaDetailSubPageValue', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaDetailSubPageValue(req, res);
	});

	router.post('/admin/getMetaTheatreValue', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaTheatreValue(req, res);
	});

	router.post('/admin/getMetaMovieValue', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaMovieValue(req, res);
	});

	router.post('/admin/getMetaShortfilmValue', Service.authenticateAdmin, async function (req, res) {
		return MetaController.getMetaShortfilmValue(req, res);
	});
	
	router.post('/admin/update_meta', Service.authenticateAdmin, async function (req, res) {
		return MetaController.updateMeta(req, res);
	});
    
    router.post('/admin/update_list_page_meta', Service.authenticateAdmin, async function (req, res) {
		return MetaController.updateListPageMeta(req, res);
	});

	router.post('/admin/edit_channels', Service.authenticateAdmin, async function (req, res) {
		return TvController.updateChannelsAdmin(req, res);
	});

	router.post('/admin/add_production_house', Service.authenticateAdmin, async function (req, res) {
		return ProductionHouseController.add(req, res);
	});

	router.post('/admin/update_production_house', Service.authenticateAdmin, async function (req, res) {
		return ProductionHouseController.update(req, res);
	});

	router.post('/admin/remove_production_house', Service.authenticateAdmin, async function (req, res) {
		return ProductionHouseController.remove(req, res);
	});

	router.post('/admin/add_document', Service.authenticateAdmin, async function (req, res) {
		return DocumentController.add(req, res);
	});

	router.post('/admin/update_document', Service.authenticateAdmin, async function (req, res) {
		return DocumentController.update(req, res);
	});

	router.post('/admin/remove_document', Service.authenticateAdmin, async function (req, res) {
		return DocumentController.remove(req, res);
	});

	router.post('/admin/add_press', Service.authenticateAdmin, async function (req, res) {
		return PressController.add(req, res);
	});

 	router.post('/admin/delete_press', Service.authenticateAdmin, async function (req, res) {
		return PressController.delete(req, res);
	});

	router.post('/admin/update_version', Service.authenticateAdmin, async function (req, res) {
		return DefaultController.updateVersion(req, res);
	});

	router.post('/admin/approve_claim', Service.authenticateAdmin, async function (req, res) {
		return ClaimController.approveClaim(req, res);
	});

	router.post('/admin/reject_claim', Service.authenticateAdmin, async function (req, res) {
		return ClaimController.rejectClaim(req, res);
	});

	router.post('/admin/claim_celeb_data', Service.authenticateAdmin, async function (req, res) {
		return ClaimController.getCeleb(req, res);
	});
    
    router.post('/admin/claim_production_data', Service.authenticateAdmin, async function (req, res) {
		return ClaimController.getProductionHouse(req, res);
	});
	
}