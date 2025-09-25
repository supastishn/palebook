import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { register as registerThunk, clearError } from '../store/slices/authSlice';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${p => p.theme.colors.primary}, ${p => p.theme.colors.secondary});
`;

const Card = styled.div`
  background-color: ${p => p.theme.colors.white};
  border-radius: ${p => p.theme.borderRadius.xl};
  box-shadow: ${p => p.theme.shadows.xl};
  padding: ${p => p.theme.spacing['3xl']};
  width: 100%;
  max-width: 480px;
`;

const Title = styled.h1`
  font-size: ${p => p.theme.typography.fontSize['3xl']};
  font-weight: ${p => p.theme.typography.fontWeight.bold};
  color: ${p => p.theme.colors.primary};
  text-align: center;
  margin-bottom: ${p => p.theme.spacing['2xl']};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${p => p.theme.spacing.lg};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${p => p.theme.spacing.lg};
`;

const Label = styled.label`
  font-weight: ${p => p.theme.typography.fontWeight.medium};
`;

const Input = styled.input`
  padding: ${p => p.theme.spacing.md};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.borderRadius.md};
`;

const Button = styled.button`
  padding: ${p => p.theme.spacing.md};
  background-color: ${p => p.theme.colors.primary};
  color: white;
  border-radius: ${p => p.theme.borderRadius.md};
  font-weight: ${p => p.theme.typography.fontWeight.bold};
`;

const Error = styled.div`
  color: ${p => p.theme.colors.error};
  font-size: ${p => p.theme.typography.fontSize.sm};
`;

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    dispatch(clearError());
    const result = await dispatch(registerThunk(data));
    if (result.type === 'auth/register/fulfilled') {
      navigate('/');
    }
  };

  return (
    <Container>
      <Card>
        <Title>Create your account</Title>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <div>
              <Label>First name</Label>
              <Input {...register('firstName', { required: true })} placeholder="Jane" />
              {errors.firstName && <Error>First name is required</Error>}
            </div>
            <div>
              <Label>Last name</Label>
              <Input {...register('lastName', { required: true })} placeholder="Doe" />
              {errors.lastName && <Error>Last name is required</Error>}
            </div>
          </Row>
          <div>
            <Label>Email</Label>
            <Input type="email" {...register('email', { required: true })} placeholder="jane@example.com" />
            {errors.email && <Error>Email is required</Error>}
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" {...register('password', { required: true, minLength: 6 })} />
            {errors.password && <Error>Password must be at least 6 characters</Error>}
          </div>
          {error && <Error>{error}</Error>}
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</Button>
        </Form>
        <p style={{ marginTop: 16 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </Container>
  );
};

export default RegisterPage;

