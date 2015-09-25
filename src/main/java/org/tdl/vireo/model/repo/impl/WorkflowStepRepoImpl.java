package org.tdl.vireo.model.repo.impl;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.tdl.vireo.model.WorkflowStep;
import org.tdl.vireo.model.repo.WorkflowStepRepo;
import org.tdl.vireo.model.repo.custom.WorkflowStepRepoCustom;

public class WorkflowStepRepoImpl implements WorkflowStepRepoCustom {

	@PersistenceContext
	private EntityManager entityManager;
	
	@Autowired
	private WorkflowStepRepo workflowStepRepo;
	
	@Override
	public WorkflowStep create(String name) {
		return workflowStepRepo.save(new WorkflowStep(name));
	}
	
	@Override
	@Transactional
	public void delete(WorkflowStep workflowStep) {
		entityManager.remove(entityManager.contains(workflowStep) ? workflowStep : entityManager.merge(workflowStep));
	}
	
}