vireo.controller("EmailWorkflowRulesController", function($controller, $scope, $q, SubmissionStateRepo, EmailTemplateRepo, OrganizationRepo, EmailRecipientType, InputType) {

	angular.extend(this, $controller("AbstractController", {$scope: $scope}));

	$scope.selectedOrganization =$scope.getSelectedOrganization();
	$scope.submissionStates = SubmissionStateRepo.getAll();
	$scope.emailTemplates = EmailTemplateRepo.getAll();
	$scope.emailRecipientType = EmailRecipientType;
	$scope.organizations = OrganizationRepo.getAll();
	$scope.stateRules = {};


	$scope.buildRecipients = function() {
		$scope.recipients = [		
			{
				name: "Submitter",
				type: EmailRecipientType.SUBMITTER, 
				data: "Submitter"
			},
			{
				name: "Assignee",
				type: EmailRecipientType.ASSIGNEE, 
				data: "Assignee"
			},
			{
				name: "Oranization",
				type: EmailRecipientType.ORGANIZATION, 
				data: null
			}
		];

		angular.forEach($scope.getSelectedOrganization().aggregateWorkflowSteps, function(aggregateWorkflowStep) {
			angular.forEach(aggregateWorkflowStep.aggregateFieldProfiles, function(aggregateFieldProfile) {
				if(aggregateFieldProfile.inputType.name === InputType.INPUT_CONTACT) {
					$scope.recipients.push({
						name: aggregateFieldProfile.fieldGlosses[0].value,
						type: EmailRecipientType.CONTACT,
						data: aggregateFieldProfile.fieldPredicate.id
					});
				}
			});
		});
	}

	$q.all([SubmissionStateRepo.ready(), EmailTemplateRepo.ready(), OrganizationRepo.ready()]).then(function() {
		$scope.openAddEmailWorkflowRuleModal = function(id) {
			$scope.buildRecipients();

			$scope.newTemplate = $scope.emailTemplates[0];
			$scope.newRecipient = $scope.recipients[0];

			$scope.openModal(id);

		};

		$scope.resetEmailWorkflowRule = function() {
			$scope.newTemplate = $scope.emailTemplates[0];
			$scope.newRecipient = $scope.recipients[0].data;
			$scope.closeModal();
		};

		$scope.addEmailWorkflowRule = function(newTemplate, newRecipient, submissionState) {

			var templateId = newTemplate.id;
			var recipient = angular.copy(newRecipient);
			var submissionStateId = submissionState.id;

			if(recipient.type==EmailRecipientType.ORGANIZATION) recipient.data = recipient.data.id;

			$scope.getSelectedOrganization().addEmailWorkflowRule(templateId, recipient, submissionStateId).then(function() {
				$scope.resetEmailWorkflowRule();
			});

		};

		$scope.openEditEmailWorkflowRule = function(rule) {
			$scope.buildRecipients();
			$scope.emailWorkflowRuleToEdit = angular.copy(rule);
			for(var i in $scope.recipients) {
				var recipient = $scope.recipients[i];
				if(recipient.name == $scope.emailWorkflowRuleToEdit.emailRecipient.name) {
					$scope.emailWorkflowRuleToEdit.emailRecipient = recipient;
					break;
				}
			}

			for(var j in $scope.emailTemplates) {
				var template = $scope.emailTemplates[j];
				if(template.id == $scope.emailWorkflowRuleToEdit.emailTemplate.id) {
					$scope.emailWorkflowRuleToEdit.emailTemplate = template;
					break;
				}
			}

			$scope.openModal("#editEmailWorkflowRule");
		};

		$scope.editEmailWorkflowRule = function() {

			if($scope.emailWorkflowRuleToEdit.emailRecipient.type==EmailRecipientType.ORGANIZATION) $scope.emailWorkflowRuleToEdit.emailRecipient.data = $scope.emailWorkflowRuleToEdit.emailRecipient.data.id;

			$scope.getSelectedOrganization().editEmailWorkflowRule($scope.emailWorkflowRuleToEdit).then(function() {
				$scope.resetEditEmailWorkflowRule();
			});
		};

		$scope.resetEditEmailWorkflowRule = function() {
			$scope.closeModal();
		};

		$scope.confirmEmailWorkflowRuleDelete = function(rule) {
			$scope.emailWorkflowRuleToDelete = rule;
			$scope.openModal("#confirmEmailWorkflowRuleDelete");
		};

		$scope.deleteEmailWorkflowRule = function() {
			$scope.emailWorkflowRuleToDelete.emailWorkflowRuleDeleteWorking = true;
			$scope.getSelectedOrganization().removeEmailWorkflowRule($scope.emailWorkflowRuleToDelete).then(function() {
				$scope.emailWorkflowRuleToDelete.emailWorkflowRuleDeleteWorking = false;
			});
		};

		$scope.changeEmailWorkflowRuleActivation = function(rule, changeEmailWorkflowRuleActivation) {
			$scope.getSelectedOrganization().changeEmailWorkflowRuleActivation(rule).then(function() {
				changeEmailWorkflowRuleActivation = false;
			});
		};

		$scope.cancelDeleteEmailWorkflowRule = function() {
			$scope.emailWorkflowRuleToDelete.emailWorkflowRuleDeleteWorking = false;
			$scope.closeModal();
		};

	});

});